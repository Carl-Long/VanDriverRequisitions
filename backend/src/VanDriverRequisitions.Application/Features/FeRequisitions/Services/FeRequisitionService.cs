using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public class FeRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator,
    IFeRequisitionLimitValidator limitValidator) : IFeRequisitionService
{
    public async Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(FeRequisitionQueryDto query, CancellationToken cancellationToken = default)
    {
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
        var existingRequisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        var driverSummary = await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == existingRequisition.VanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(existingRequisition, driverSummary);
    }

    public async Task<FeRequisitionDetailDto> CreateAsync(SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);
        
        var requisitionNumber = await context.NextFeRequisitionNumberAsync(cancellationToken);
        var requisitionData = await BuildRequisitionDataAsync(saveFeRequisitionDto, cancellationToken);
        var requisition = FeRequisition.Create(requisitionNumber, requisitionData.Details, requisitionData.TaskModels);
        
        await limitValidator.ValidateAsync(requisition, cancellationToken);

        context.FeRequisitions.Add(requisition);

        await context.SaveChangesAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, requisitionData.DriverSummary);
    }
    
    public async Task<FeRequisitionDetailDto> UpdateAsync(Guid id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var existingRequisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        context.Entry(existingRequisition)
            .Property(nameof(FeRequisition.RowVersion))
            .OriginalValue = saveFeRequisitionDto.RowVersion;

        var requisitionData = await BuildRequisitionDataAsync(saveFeRequisitionDto, cancellationToken);
        existingRequisition.UpdateDetails(requisitionData.Details);
        existingRequisition.SyncGeneralTasks(requisitionData.TaskModels);

        await limitValidator.ValidateAsync(existingRequisition, cancellationToken);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException(
                "This requisition has been updated by another user since you opened it. " +
                "Refresh the page to load the latest version. " +
                "Any changes you have made since opening the requisition will need to be re-entered."
            );
        }

        return FeRequisitionMapper.MapRequisitionToDetailDto(existingRequisition, requisitionData.DriverSummary);
    }
    
    public async Task<FeRequisitionDetailDto> SubmitAsync(Guid? id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        if (currentUser.User is null) throw new NotFoundException("Submissions must be done via a user.");
        
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        FeRequisition requisition;

        var requisitionData = await BuildRequisitionDataAsync(saveFeRequisitionDto, cancellationToken);

        if (id.HasValue)
        {
            requisition = await LoadFullAsync(id.Value, cancellationToken)
                          ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

            context.Entry(requisition)
                .Property(nameof(FeRequisition.RowVersion))
                .OriginalValue = saveFeRequisitionDto.RowVersion;

            requisition.UpdateDetails(requisitionData.Details);
            requisition.SyncGeneralTasks(requisitionData.TaskModels);
        }
        else
        {
            var requisitionNumber = await context.NextFeRequisitionNumberAsync(cancellationToken);
            requisition = FeRequisition.Create(requisitionNumber, requisitionData.Details, requisitionData.TaskModels);
            context.FeRequisitions.Add(requisition);
        }

        await limitValidator.ValidateAsync(requisition, cancellationToken);

        var now = DateTime.UtcNow;
        var snapshotJson = FeRequisitionSnapshotFactory.CreateJson(requisition);

        var submission = FeRequisitionSubmission.Create(
                requisition.NextSubmissionNumber,
                currentUser.User.Id,
                currentUser.User.Name,
                now,
                snapshotJson);

        requisition.AddSubmission(submission);
        requisition.Submit(currentUser.User.Id, currentUser.User.Name, now);

        await context.SaveChangesAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, requisitionData.DriverSummary);
    }
    
    public async Task<FeRequisitionDetailDto> ApproveAsync(Guid id, ApproveFeRequisitionDto approveFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        if (currentUser.User is null)
        {
            throw new NotFoundException("Approval must be performed by a user.");
        }

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        context.Entry(requisition)
            .Property(nameof(FeRequisition.RowVersion))
            .OriginalValue = approveFeRequisitionDto.RowVersion;

        requisition.ApproveSubmission(currentUser.User.Id, currentUser.User.Name, DateTime.UtcNow, approveFeRequisitionDto.PoNumber);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This requisition has been updated by another user.");
        }

        var driverSummary = await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == requisition.VanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, driverSummary);
    }
    
    public async Task<FeRequisitionDetailDto> RejectAsync(Guid id, RejectFeRequisitionDto rejectFeRequisitionDto, CancellationToken cancellationToken = default)
    {
        if (currentUser.User is null)
        {
            throw new NotFoundException("Rejection must be performed by a user.");
        }

        var requisition = await LoadFullAsync(id, cancellationToken)
                          ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        context.Entry(requisition)
            .Property(nameof(FeRequisition.RowVersion))
            .OriginalValue = rejectFeRequisitionDto.RowVersion;

        requisition.RejectSubmission(currentUser.User.Id, currentUser.User.Name, rejectFeRequisitionDto.RejectionNotes, DateTime.UtcNow);

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This requisition has been updated by another user.");
        }

        var driverSummary = await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == requisition.VanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, driverSummary);
    }
    
    public async Task<FeRequisitionSubmissionDetailDto> GetSubmissionAsync(Guid submissionId, CancellationToken cancellationToken = default)
    {
        var submission = await context.FeRequisitionSubmissions
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.Id == submissionId,
                cancellationToken);

        if (submission is null)
        {
            throw new NotFoundException($"Submission '{submissionId}' was not found.");
        }
        
        var snapshot = JsonSerializer.Deserialize<FeRequisitionSnapshotDto>(submission.SnapshotJson);
        if (snapshot is null)
        {
            throw new InvalidOperationException($"Submission '{submissionId}' contains an invalid snapshot.");
        }
        
        return new FeRequisitionSubmissionDetailDto
        {
            Id = submission.Id,
            SubmissionNumber = submission.SubmissionNumber,
            Status = submission.Status.ToString(),
            SubmittedByName = submission.SubmittedByNameSnapshot,
            SubmittedAtUtc = submission.SubmittedAtUtc,
            ReviewedByName = submission.ReviewedByNameSnapshot,
            ReviewedAtUtc = submission.ReviewedAtUtc,
            RejectionNotes = submission.RejectionNotes,
            Snapshot = snapshot
        };
    }

    private async Task<FeRequisition?> LoadFullAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.FeRequisitions
            .Include(x => x.FeGeneralTasks)
            .Include(x => x.FeMileages)
            .Include(x => x.FeTransfers)
            .Include(x => x.FeAdditionalCosts)
            .Include(x => x.Submissions)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private static List<FeGeneralTaskUpdateModel> BuildGeneralTaskModels(
        IEnumerable<SaveFeGeneralTaskDto> tasks,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypeMap)
    {
        return tasks
            .Select(dto =>
            {
                var taskType = taskTypeMap[dto.FeTaskTypeId];

                return new FeGeneralTaskUpdateModel(
                    dto.Id,
                    dto.FeTaskTypeId,
                    taskType.Name,
                    taskType.Code,
                    dto.WeekEndingDate,
                    new WeeklyQuantities(
                        dto.Week.Sunday,
                        dto.Week.Monday,
                        dto.Week.Tuesday,
                        dto.Week.Wednesday,
                        dto.Week.Thursday,
                        dto.Week.Friday,
                        dto.Week.Saturday),
                    dto.RatePerJob);
            })
            .ToList();
    }
    
    private async Task<RequisitionBuildData> BuildRequisitionDataAsync(SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var driverSummary = await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == saveFeRequisitionDto.VanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);

        var shop = await context.Shops
            .AsNoTracking()
            .SingleAsync(x => x.Id == saveFeRequisitionDto.ShopId, cancellationToken);

        var taskTypeIds = saveFeRequisitionDto.FeGeneralTasks
            .Select(x => x.FeTaskTypeId)
            .Distinct()
            .ToList();

        var taskTypeMap = await context.FeTaskTypes
            .Where(x => taskTypeIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        var details = new RequisitionDetails(
            saveFeRequisitionDto.RequisitionDate,
            new VanDriverSnapshot(
                driverSummary.Id,
                driverSummary.Code,
                saveFeRequisitionDto.VanDriverName.Trim(),
                driverSummary.TradersName,
                driverSummary.HasVat),
            new ShopSnapshot(
                shop.Id,
                shop.Code,
                shop.Name));

        var taskModels = BuildGeneralTaskModels(saveFeRequisitionDto.FeGeneralTasks, taskTypeMap);

        return new RequisitionBuildData(driverSummary, details, taskModels);
    }
    
    private sealed record RequisitionBuildData(VanDriverLookupDto DriverSummary, RequisitionDetails Details, List<FeGeneralTaskUpdateModel> TaskModels);
}