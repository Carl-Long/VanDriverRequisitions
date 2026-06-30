using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Builders;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.Features.SubmitWindows.Services;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Application.Common.Requisitions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public class FeRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator,
    IPoNumberGenerator poNumberGenerator,
    IFeRequisitionLimitValidator limitValidator,
    IFeRequisitionNumberGenerator feRequisitionNumberGenerator,
    IFeRequisitionSaveDataBuilder saveDataBuilder,
    TimeProvider timeProvider,
    ISubmitWindowSubmissionGuard submitWindowGuard,
    IRequisitionLookupLoader lookupLoader) : IFeRequisitionService
{
    public async Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(FeRequisitionQueryDto query,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        var dbQuery = context.FeRequisitions.ApplyFilters(query);
        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .AsNoTracking()
            .OrderByDescending(x => x.UpdatedAtUtc)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(FeRequisitionProjections.AsSummaryDto)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<FeRequisitionSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    public async Task<FeRequisitionDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var requisition = await LoadFullAsync(id, cancellationToken) ?? throw new NotFoundException($"FE Requisition with ID '{id}' was not found.");
        var driverSummary = await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);
        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    public async Task<FeRequisitionSubmissionDetailDto> GetSubmissionAsync(Guid submissionId, CancellationToken cancellationToken = default)
    {
        var submission = await context.FeRequisitionSubmissions
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == submissionId, cancellationToken);

        if (submission is null)
        {
            throw new NotFoundException($"Submission '{submissionId}' was not found.");
        }

        var snapshot = JsonSerializer.Deserialize<FeRequisitionSnapshotDto>(submission.SnapshotJson);

        return snapshot is not null
            ? FeRequisitionSubmissionMapper.MapFeSubmissionToDetailDto(submission, snapshot)
            : throw new InvalidOperationException($"Submission '{submissionId}' contains an invalid snapshot.");
    }
    
    public async Task<FeRequisitionDetailDto> CreateAsync(SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var saveResult = await CreateNewForSaveAsync(saveFeRequisitionDto, cancellationToken);
        
        await limitValidator.ValidateAsync(saveResult.Requisition, cancellationToken);
        
        await context.SaveChangesAsync(cancellationToken);

        return await MapToDetailDtoAsync(
            saveResult.Requisition,
            saveResult.SaveData.DriverSummary,
            saveResult.SaveData.IsShopActive,
            cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> UpdateAsync(Guid id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var saveResult = await UpdateExistingForSaveAsync(id, saveFeRequisitionDto, cancellationToken);

        await limitValidator.ValidateAsync(saveResult.Requisition, cancellationToken);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(
            saveResult.Requisition,
            saveResult.SaveData.DriverSummary,
            saveResult.SaveData.IsShopActive,
            cancellationToken);
    }
    
    public async Task<FeRequisitionDetailDto> SubmitAsync(Guid? id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);
        await submitWindowGuard.EnsureSubmissionWindowIsOpenAsync(cancellationToken);

        var saveResult = id.HasValue
            ? await UpdateExistingForSaveAsync(id.Value, saveFeRequisitionDto, cancellationToken)
            : await CreateNewForSaveAsync(saveFeRequisitionDto, cancellationToken);

        await limitValidator.ValidateAsync(saveResult.Requisition, cancellationToken);

        var snapshotJson = FeRequisitionSnapshotFactory.CreateJson(saveResult.Requisition);

        saveResult.Requisition.Submit(auditUser, timeProvider.GetUtcDateTime(), snapshotJson);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(saveResult.Requisition, saveResult.SaveData.DriverSummary, saveResult.SaveData.IsShopActive, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> ApproveAsync(Guid id, ApproveFeRequisitionDto approveFeRequisitionDto,
        CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(approveFeRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"FE Requisition with ID '{id}' was not found.");

        context.SetOriginalRowVersion(requisition, approveFeRequisitionDto.RowVersion);

        var poNumber = await poNumberGenerator.GenerateAsync(cancellationToken);

        requisition.ApproveSubmission(auditUser, timeProvider.GetUtcDateTime(), poNumber);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary =
            await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);

        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> RejectAsync(Guid id, RejectFeRequisitionDto rejectFeRequisitionDto,
        CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(rejectFeRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"FE requisition with ID '{id}' was not found.");

        context.SetOriginalRowVersion(requisition, rejectFeRequisitionDto.RowVersion);

        requisition.RejectSubmission(auditUser, timeProvider.GetUtcDateTime(), rejectFeRequisitionDto.RejectionNotes);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary =
            await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);

        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    private async Task<FeRequisition?> LoadFullAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.FeRequisitions
            .AsSplitQuery()
            .Include(x => x.FeGeneralTasks)
            .Include(x => x.FeMileages)
            .Include(x => x.FeTransfers)
            .Include(x => x.FeAdditionalCosts)
            .Include(x => x.Submissions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<FeRequisitionDetailDto> MapToDetailDtoAsync(FeRequisition requisition,
        VanDriverLookupDto? driverSummary, bool? isShopActive, CancellationToken cancellationToken)
    {
        driverSummary ??=
            await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);
        var shopActive = isShopActive ?? await lookupLoader.IsShopActiveAsync(requisition.ShopId, cancellationToken);
        var reasonActiveMap = await LoadAdditionalCostReasonActiveMapAsync(requisition, cancellationToken);
        var transferShopActiveMap = await LoadTransferShopActiveMapAsync(requisition, cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, driverSummary, shopActive, reasonActiveMap,
            transferShopActiveMap);
    }

    private async Task<Dictionary<Guid, bool>> LoadAdditionalCostReasonActiveMapAsync(FeRequisition requisition, CancellationToken cancellationToken)
    {
        return await lookupLoader.LoadCostReasonActiveMapAsync(requisition.FeAdditionalCosts.Select(x => x.ReasonId), cancellationToken);
    }

    private async Task<Dictionary<Guid, bool>> LoadTransferShopActiveMapAsync(FeRequisition requisition, CancellationToken cancellationToken)
    {
        return await lookupLoader.LoadShopActiveMapAsync(requisition.FeTransfers.SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo }), cancellationToken);
    }

    private async Task<FeRequisitionSaveResult> CreateNewForSaveAsync(SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var saveData = await saveDataBuilder.BuildAsync(saveFeRequisitionDto, existingRequisition: null, cancellationToken);

        EnsureNewRootLookupsAreActive(saveData);

        var requisitionNumber = await feRequisitionNumberGenerator.GenerateAsync(cancellationToken);
        var requisition = FeRequisition.Create(requisitionNumber, saveData.UpdateModel);

        context.FeRequisitions.Add(requisition);

        return new FeRequisitionSaveResult(requisition, saveData);
    }

    private async Task<FeRequisitionSaveResult> UpdateExistingForSaveAsync(Guid id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"Fe requisition with ID '{id}' was not found.");

        context.SetOriginalRowVersion(requisition, saveFeRequisitionDto.RowVersion);

        var saveData = await saveDataBuilder.BuildAsync(saveFeRequisitionDto, requisition, cancellationToken);

        EnsureExistingRootLookupsAreActiveOrUnchanged(requisition, saveData);

        requisition.Update(saveData.UpdateModel);

        return new FeRequisitionSaveResult(requisition, saveData);
    }

    private static void EnsureNewRootLookupsAreActive(FeRequisitionSaveData saveData)
    {
        InactiveLookupGuard.EnsureActiveForNewRequisition(saveData.DriverSummary.IsActive, $"Van driver '{saveData.DriverSummary.Code} - {saveData.DriverSummary.TradersName}'");
        InactiveLookupGuard.EnsureActiveForNewRequisition(saveData.IsShopActive, $"Shop '{saveData.UpdateModel.Details.Shop.Code} - {saveData.UpdateModel.Details.Shop.Name}'");
    }

    private static void EnsureExistingRootLookupsAreActiveOrUnchanged(FeRequisition requisition, FeRequisitionSaveData saveData)
    {
        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingLookup(
            requisition.VanDriverId,
            saveData.UpdateModel.Details.Driver.Id,
            saveData.DriverSummary.IsActive,
            $"Van driver '{saveData.DriverSummary.Code} - {saveData.DriverSummary.TradersName}'");

        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingLookup(
            requisition.ShopId,
            saveData.UpdateModel.Details.Shop.Id,
            saveData.IsShopActive,
            $"Shop '{saveData.UpdateModel.Details.Shop.Code} - {saveData.UpdateModel.Details.Shop.Name}'");
    }

    private sealed record FeRequisitionSaveResult(FeRequisition Requisition, FeRequisitionSaveData SaveData);
}