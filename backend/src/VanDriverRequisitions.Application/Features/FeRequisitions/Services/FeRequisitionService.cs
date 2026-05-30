using System.ComponentModel.DataAnnotations;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public class FeRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator) : IFeRequisitionService
{
    public async Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(FeRequisitionQueryDto query, CancellationToken cancellationToken = default)
    {
        var userId = currentUser?.User?.Id ?? throw new UnauthorizedAccessException();

        var dbQuery = context.FeRequisitions.ApplyFilters(query, userId);

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .OrderByDescending(x => x.RequisitionDate)
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

        var shop = await context.Shops.SingleAsync(x => x.Id == existingRequisition.ShopId, cancellationToken);

        var driverSummary = await context.VanDrivers
            .Where(x => x.Id == existingRequisition.VanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(existingRequisition, driverSummary);
    }

public async Task<FeRequisitionDetailDto> CreateAsync(
    SaveFeRequisitionDto saveFeRequisitionDto,
    CancellationToken cancellationToken = default)
{
    await validator.ValidateAsync(
        saveFeRequisitionDto,
        cancellationToken);

    var driverSummary = await context.VanDrivers
        .Where(x => x.Id == saveFeRequisitionDto.VanDriverId)
        .Select(VanDriverProjections.AsLookupDto)
        .SingleAsync(cancellationToken);

    var shop = await context.Shops
        .SingleAsync(
            x => x.Id == saveFeRequisitionDto.ShopId,
            cancellationToken);

    var taskTypeIds = saveFeRequisitionDto.FeGeneralTasks
        .Select(x => x.FeTaskTypeId)
        .Distinct()
        .ToList();

    var taskTypeMap = await context.FeTaskTypes
        .Where(x => taskTypeIds.Contains(x.Id))
        .ToDictionaryAsync(x => x.Id, cancellationToken);

    var requisitionNumber =
        await context.NextFeRequisitionNumberAsync(cancellationToken);

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

    var taskModels = saveFeRequisitionDto.FeGeneralTasks
        .Select(dto =>
        {
            var taskType = taskTypeMap[dto.FeTaskTypeId];

            return new FeGeneralTaskUpdateModel(
                null,
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
        });

    var requisition = FeRequisition.Create(
        requisitionNumber,
        details,
        taskModels);

    context.FeRequisitions.Add(requisition);

    await context.SaveChangesAsync(cancellationToken);

    return FeRequisitionMapper.MapRequisitionToDetailDto(
        requisition,
        driverSummary);
}
   public async Task<FeRequisitionDetailDto> UpdateAsync(
    Guid id,
    SaveFeRequisitionDto saveFeRequisitionDto,
    CancellationToken cancellationToken = default)
{
    await validator.ValidateAsync(
        saveFeRequisitionDto,
        cancellationToken);

    var requisition = await LoadFullAsync(id, cancellationToken)
        ?? throw new NotFoundException(
            $"Requisition with ID '{id}' was not found.");

    context.Entry(requisition)
        .Property(nameof(FeRequisition.RowVersion))
        .OriginalValue = saveFeRequisitionDto.RowVersion;

    var driverSummary = await context.VanDrivers
        .Where(x => x.Id == saveFeRequisitionDto.VanDriverId)
        .Select(VanDriverProjections.AsLookupDto)
        .SingleAsync(cancellationToken);

    var shop = await context.Shops
        .SingleAsync(
            x => x.Id == saveFeRequisitionDto.ShopId,
            cancellationToken);

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

    requisition.UpdateDetails(details);

    var taskModels = saveFeRequisitionDto.FeGeneralTasks
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
        });

    requisition.SyncGeneralTasks(taskModels);

    try
    {
        await context.SaveChangesAsync(cancellationToken);
    }
    catch (DbUpdateConcurrencyException)
    {
        throw new ConflictException(
            "This requisition has been modified by another user.");
    }

    return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, driverSummary);
}

    private async Task<FeRequisition?> LoadFullAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.FeRequisitions
            .Include(x => x.FeGeneralTasks)
            .Include(x => x.FeMileages)
            .Include(x => x.FeTransfers)
            .Include(x => x.FeAdditionalCosts)
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
}