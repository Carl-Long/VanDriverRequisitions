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
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public class FeRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator,
    IPoNumberGenerator poNumberGenerator,
    IFeRequisitionLimitValidator limitValidator,
    IFeRequisitionNumberGenerator feRequisitionNumberGenerator,
    IFeRequisitionSaveDataBuilder saveDataBuilder,
    TimeProvider timeProvider) : IFeRequisitionService
{
    public async Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(FeRequisitionQueryDto query, CancellationToken cancellationToken = default)
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
        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        var driverSummary = await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);
        
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

        var requisitionNumber = await feRequisitionNumberGenerator.GenerateAsync(cancellationToken);
        
        var saveData = await saveDataBuilder.BuildAsync(saveFeRequisitionDto, cancellationToken);

        var requisition = FeRequisition.Create(requisitionNumber, saveData.UpdateModel);

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        context.FeRequisitions.Add(requisition);

        await context.SaveChangesAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> UpdateAsync(Guid id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        SetOriginalRowVersion(requisition, saveFeRequisitionDto.RowVersion);

        var saveData = await saveDataBuilder.BuildAsync(saveFeRequisitionDto, cancellationToken);
        
        requisition.Update(saveData.UpdateModel);
        
        await limitValidator.ValidateAsync(requisition, cancellationToken);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> SubmitAsync(Guid? id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var saveData = await saveDataBuilder.BuildAsync(saveFeRequisitionDto, cancellationToken);

        FeRequisition requisition;

        if (id.HasValue)
        {
            requisition = await LoadFullAsync(id.Value, cancellationToken)
                ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

            SetOriginalRowVersion(requisition, saveFeRequisitionDto.RowVersion);
            requisition.Update(saveData.UpdateModel);
        }
        else
        {
            var requisitionNumber = await feRequisitionNumberGenerator.GenerateAsync(cancellationToken);
            requisition = FeRequisition.Create(requisitionNumber, saveData.UpdateModel);
            
            context.FeRequisitions.Add(requisition);
        }

        await limitValidator.ValidateAsync(requisition, cancellationToken);
        
        var snapshotJson = FeRequisitionSnapshotFactory.CreateJson(requisition);
        
        requisition.Submit(auditUser, timeProvider.GetUtcDateTime(), snapshotJson);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        return await MapToDetailDtoAsync(requisition, saveData.DriverSummary, saveData.IsShopActive, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> ApproveAsync(Guid id, ApproveFeRequisitionDto approveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();
        
        await validator.ValidateAsync(approveFeRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        SetOriginalRowVersion(requisition, approveFeRequisitionDto.RowVersion);

        var poNumber = await poNumberGenerator.GenerateAsync(cancellationToken);

        requisition.ApproveSubmission(auditUser, timeProvider.GetUtcDateTime(), poNumber);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);
        
        var driverSummary = await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);

        return await MapToDetailDtoAsync(requisition, driverSummary, null, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> RejectAsync(Guid id, RejectFeRequisitionDto rejectFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        var auditUser = currentUser.RequireAuditUser();

        await validator.ValidateAsync(rejectFeRequisitionDto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        SetOriginalRowVersion(requisition, rejectFeRequisitionDto.RowVersion);

        requisition.RejectSubmission(auditUser, timeProvider.GetUtcDateTime(), rejectFeRequisitionDto.RejectionNotes);

        await context.SaveChangesWithConcurrencyHandlingAsync(cancellationToken);

        var driverSummary = await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);

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
    
    private async Task<FeRequisitionDetailDto> MapToDetailDtoAsync(
        FeRequisition requisition,
        VanDriverLookupDto? driverSummary,
        bool? isShopActive,
        CancellationToken cancellationToken)
    {
        driverSummary ??= await LoadDriverSummaryAsync(requisition.VanDriverId, cancellationToken);
        var shopActive = isShopActive ?? await IsShopActiveAsync(requisition.ShopId, cancellationToken);
        var reasonActiveMap = await LoadAdditionalCostReasonActiveMapAsync(requisition, cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, driverSummary, shopActive, reasonActiveMap);
    }
    
    private async Task<Dictionary<Guid, bool>> LoadAdditionalCostReasonActiveMapAsync(FeRequisition requisition, CancellationToken cancellationToken)
    {
        var reasonIds = requisition.FeAdditionalCosts
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
    
    private void SetOriginalRowVersion(FeRequisition requisition, byte[]? rowVersion)
    {
        if (rowVersion is null) return;
        
        context.Entry(requisition).Property(nameof(FeRequisition.RowVersion)).OriginalValue = rowVersion;
    }
}