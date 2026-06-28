using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Common.Requisitions;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.StdRequisitions.Builders;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Extensions;
using VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.Features.SubmitWindows.Services;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Services;

public sealed class StdRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator,
    IPoNumberGenerator poNumberGenerator,
    IStdRequisitionNumberGenerator stdRequisitionNumberGenerator,
    IStdRequisitionSaveDataBuilder saveDataBuilder,
    IStdRequisitionLimitValidator limitValidator,
    TimeProvider timeProvider,
    ISubmitWindowSubmissionGuard submitWindowGuard,
    IRequisitionLookupLoader lookupLoader) : IStdRequisitionService
{
    public async Task<PagedResult<StdRequisitionSummaryDto>> GetAllAsync(StdRequisitionQueryDto query, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        var dbQuery = context.StdRequisitions.ApplyFilters(query);

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .AsNoTracking()
            .OrderByDescending(x => x.UpdatedAtUtc)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(StdRequisitionProjections.AsSummaryDto)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<StdRequisitionSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<StdRequisitionDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);

        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    public async Task<StdRequisitionSubmissionDetailDto> GetSubmissionAsync(Guid submissionId, CancellationToken cancellationToken = default)
    {
        var submission = await context.StdRequisitionSubmissions
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.Id == submissionId, cancellationToken);

        if (submission is null)
        {
            throw new NotFoundException($"STD submission '{submissionId}' was not found.");
        }

        var snapshot = JsonSerializer.Deserialize<StdRequisitionSnapshotDto>(submission.SnapshotJson);

        return snapshot is not null
            ? StdRequisitionSubmissionMapper.MapStdSubmissionToDetailDto(submission, snapshot)
            : throw new InvalidOperationException($"STD submission '{submissionId}' contains an invalid snapshot.");
    }

    public async Task<StdRequisitionDetailDto> CreateAsync(SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveStdRequisitionDto, cancellationToken);

        var requisitionNumber = await stdRequisitionNumberGenerator.GenerateAsync(cancellationToken);

        var saveData = await saveDataBuilder.BuildAsync(saveStdRequisitionDto, cancellationToken);
        
        InactiveLookupGuard.EnsureActiveForNewRequisition(saveData.DriverSummary.IsActive, $"Van driver '{saveData.DriverSummary.Code} - {saveData.DriverSummary.TradersName}'");
        InactiveLookupGuard.EnsureActiveForNewRequisition(saveData.IsShopActive, $"Shop '{saveData.UpdateModel.Details.Shop.Code} - {saveData.UpdateModel.Details.Shop.Name}'");
        
        var requisition = StdRequisition.Create(requisitionNumber, saveData.UpdateModel);

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        context.StdRequisitions.Add(requisition);

        await context.SaveChangesAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> UpdateAsync(Guid id, SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveStdRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

        context.SetOriginalRowVersion(requisition, saveStdRequisitionDto.RowVersion);

        var saveData = await saveDataBuilder.BuildAsync(saveStdRequisitionDto, cancellationToken);

        requisition.Update(saveData.UpdateModel);

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> SubmitAsync(Guid? id, SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(saveStdRequisitionDto, cancellationToken);
        await submitWindowGuard.EnsureSubmissionWindowIsOpenAsync(cancellationToken);
        
        var saveData = await saveDataBuilder.BuildAsync(saveStdRequisitionDto, cancellationToken);

        StdRequisition requisition;

        if (id.HasValue)
        {
            requisition = await LoadFullAsync(id.Value, cancellationToken)
                          ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

            context.SetOriginalRowVersion(requisition, saveStdRequisitionDto.RowVersion);
            requisition.Update(saveData.UpdateModel);
        }
        else
        {
            InactiveLookupGuard.EnsureActiveForNewRequisition(saveData.DriverSummary.IsActive, $"Van driver '{saveData.DriverSummary.Code} - {saveData.DriverSummary.TradersName}'");
            InactiveLookupGuard.EnsureActiveForNewRequisition(saveData.IsShopActive, $"Shop '{saveData.UpdateModel.Details.Shop.Code} - {saveData.UpdateModel.Details.Shop.Name}'");
            
            var requisitionNumber = await stdRequisitionNumberGenerator.GenerateAsync(cancellationToken);
            requisition = StdRequisition.Create(requisitionNumber, saveData.UpdateModel);
            context.StdRequisitions.Add(requisition);
        }

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        var snapshotJson = StdRequisitionSnapshotFactory.CreateJson(requisition);

        requisition.Submit(auditUser, timeProvider.GetUtcDateTime(), snapshotJson);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> ApproveAsync(Guid id, ApproveStdRequisitionDto approveStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(approveStdRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

        context.SetOriginalRowVersion(requisition, approveStdRequisitionDto.RowVersion);

        var poNumber = await poNumberGenerator.GenerateAsync(cancellationToken);

        requisition.ApproveSubmission(auditUser, timeProvider.GetUtcDateTime(), poNumber);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);

        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> RejectAsync(Guid id, RejectStdRequisitionDto rejectStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(rejectStdRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");
        
        context.SetOriginalRowVersion(requisition, rejectStdRequisitionDto.RowVersion);

        requisition.RejectSubmission(auditUser, timeProvider.GetUtcDateTime(), rejectStdRequisitionDto.RejectionNotes);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);
        
        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    private async Task<StdRequisition?> LoadFullAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.StdRequisitions
            .AsSplitQuery()
            .Include(x => x.CollectionChargesBanksAndBins)
            .Include(x => x.CollectionVanPacks)
            .Include(x => x.AdditionalCosts)
            .Include(x => x.Transfers)
            .Include(x => x.Pickups)
            .Include(x => x.Submissions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }
    
    private async Task<StdRequisitionDetailDto> MapToDetailDtoAsync(
        StdRequisition requisition,
        VanDriverLookupDto? driverSummary,
        bool? isShopActive,
        CancellationToken cancellationToken)
    {
        driverSummary ??= await lookupLoader.LoadDriverLookupAsync(requisition.VanDriverId, cancellationToken, includeInactive: true);
        var shopActive = isShopActive ?? await lookupLoader.IsShopActiveAsync(requisition.ShopId, cancellationToken);

        var additionalCostReasonActiveMap = await LoadAdditionalCostReasonActiveMapAsync(requisition, cancellationToken);
        var collectionTypeActiveMap = await LoadCollectionTypeActiveMapAsync(requisition, cancellationToken);
        var locationActiveMap = await LoadLocationActiveMapAsync(requisition, cancellationToken);

        return StdRequisitionMapper.MapRequisitionToDetailDto(
            requisition,
            driverSummary,
            shopActive,
            additionalCostReasonActiveMap,
            collectionTypeActiveMap,
            locationActiveMap);
    }
    
    private async Task<Dictionary<Guid, bool>> LoadAdditionalCostReasonActiveMapAsync(StdRequisition requisition, CancellationToken cancellationToken)
    {
        var reasonIds = requisition.AdditionalCosts
            .Select(x => x.ReasonId)
            .Distinct()
            .ToList();

        if (reasonIds.Count == 0)
        {
            return new Dictionary<Guid, bool>();
        }

        return await context.CostReasons
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => reasonIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.IsActive, cancellationToken);
    }

    private async Task<Dictionary<Guid, bool>> LoadCollectionTypeActiveMapAsync(StdRequisition requisition, CancellationToken cancellationToken)
    {
        var collectionTypeIds = requisition.CollectionChargesBanksAndBins
            .Select(x => x.CollectionTypeId)
            .Distinct()
            .ToList();

        if (collectionTypeIds.Count == 0)
        {
            return new Dictionary<Guid, bool>();
        }

        return await context.StdCollectionTypes
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => collectionTypeIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.IsActive, cancellationToken);
    }

    private async Task<Dictionary<Guid, bool>> LoadLocationActiveMapAsync(StdRequisition requisition, CancellationToken cancellationToken) {
        var locationIds = requisition.CollectionChargesBanksAndBins
            .Select(x => x.LocationId)
            .Distinct()
            .ToList();

        if (locationIds.Count == 0)
        {
            return new Dictionary<Guid, bool>();
        }

        return await context.StdLocations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => locationIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, x => x.IsActive, cancellationToken);
    }
}