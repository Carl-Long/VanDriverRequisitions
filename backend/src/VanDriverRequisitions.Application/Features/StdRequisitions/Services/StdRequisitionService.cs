using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.StdRequisitions.Builders;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Extensions;
using VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Services;

public sealed class StdRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator,
    IPoNumberGenerator poNumberGenerator,
    IStdRequisitionNumberGenerator stdRequisitionNumberGenerator,
    IStdRequisitionSaveDataBuilder saveDataBuilder,
    IStdRequisitionLimitValidator limitValidator,
    TimeProvider timeProvider) : IStdRequisitionService
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

        var driverSummary = await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);

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

        SetOriginalRowVersion(requisition, saveStdRequisitionDto.RowVersion);

        var saveData = await saveDataBuilder.BuildAsync(saveStdRequisitionDto, cancellationToken);

        requisition.Update(saveData.UpdateModel);

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        await SaveWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> SubmitAsync(Guid? id, SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = GetAuditUser("Submission");

        await validator.ValidateAsync(saveStdRequisitionDto, cancellationToken);

        var saveData = await saveDataBuilder.BuildAsync(saveStdRequisitionDto, cancellationToken);

        StdRequisition requisition;

        if (id.HasValue)
        {
            requisition = await LoadFullAsync(id.Value, cancellationToken)
                          ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

            SetOriginalRowVersion(requisition, saveStdRequisitionDto.RowVersion);
            requisition.Update(saveData.UpdateModel);
        }
        else
        {
            var requisitionNumber = await stdRequisitionNumberGenerator.GenerateAsync(cancellationToken);
            requisition = StdRequisition.Create(requisitionNumber, saveData.UpdateModel);
            context.StdRequisitions.Add(requisition);
        }

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        var snapshotJson = StdRequisitionSnapshotFactory.CreateJson(requisition);

        requisition.Submit(auditUser, timeProvider.GetUtcDateTime(), snapshotJson);

        await SaveWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> ApproveAsync(Guid id, ApproveStdRequisitionDto approveStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = GetAuditUser("Approval");

        await validator.ValidateAsync(approveStdRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

        SetOriginalRowVersion(requisition, approveStdRequisitionDto.RowVersion);

        var poNumber = await poNumberGenerator.GenerateAsync(cancellationToken);

        requisition.ApproveSubmission(auditUser, timeProvider.GetUtcDateTime(), poNumber);

        await SaveWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary = await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);

        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    public async Task<StdRequisitionDetailDto> RejectAsync(Guid id, RejectStdRequisitionDto rejectStdRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = GetAuditUser("Rejection");

        await validator.ValidateAsync(rejectStdRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"STD requisition with ID '{id}' was not found.");

        SetOriginalRowVersion(requisition, rejectStdRequisitionDto.RowVersion);

        requisition.RejectSubmission(auditUser, timeProvider.GetUtcDateTime(), rejectStdRequisitionDto.RejectionNotes);

        await SaveWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary = await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);

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

    private async Task<VanDriverLookupDto> LoadDriverSummaryAsync(Guid vanDriverId, CancellationToken cancellationToken)
    {
        var driver = await context.VanDrivers
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.Id == vanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleOrDefaultAsync(cancellationToken);

        return driver ?? throw new NotFoundException($"Van driver '{vanDriverId}' was not found.");
    }

    private async Task<bool> IsShopActiveAsync(Guid shopId, CancellationToken cancellationToken)
    {
        var isActive = await context.Shops
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => x.Id == shopId)
            .Select(x => (bool?)x.IsActive)
            .SingleOrDefaultAsync(cancellationToken);

        return isActive ?? throw new NotFoundException($"Shop '{shopId}' was not found.");
    }

    private async Task<StdRequisitionDetailDto> MapToDetailDtoAsync(
        StdRequisition requisition,
        VanDriverLookupDto? driverSummary,
        bool? isShopActive,
        CancellationToken cancellationToken)
    {
        driverSummary ??= await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);
        var shopActive = isShopActive ?? await IsShopActiveAsync(requisition.ShopId, cancellationToken);

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

    private void SetOriginalRowVersion(StdRequisition requisition, byte[]? rowVersion)
    {
        if (rowVersion is null)
        {
            return;
        }

        context.Entry(requisition)
            .Property(nameof(StdRequisition.RowVersion))
            .OriginalValue = rowVersion;
    }

    private AuditUser GetAuditUser(string actionName)
    {
        return currentUser.User is not null
            ? new AuditUser(currentUser.User.Id, currentUser.User.Name)
            : throw new NotFoundException($"{actionName} must be performed by a user.");
    }
    
    private async Task SaveWithConcurrencyHandlingAsync(CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException(
                "This requisition has been updated by another user since you opened it. " +
                "Refresh the page to load the latest version. " +
                "Any changes you have made since opening the requisition will need to be re-entered.");
        }
    }
}