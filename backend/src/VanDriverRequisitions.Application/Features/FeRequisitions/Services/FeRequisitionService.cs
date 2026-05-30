using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Extensions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;
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

    public async Task<FeRequisitionDetailDto> CreateAsync(SaveFeRequisitionDto saveFeRequisitionDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var driverSummary = await context.VanDrivers
                   .Where(x => x.Id == saveFeRequisitionDto.VanDriverId)
                   .Select(VanDriverProjections.AsLookupDto)
                   .SingleAsync(cancellationToken);

        var shop = await context.Shops.SingleAsync(x => x.Id == saveFeRequisitionDto.ShopId, cancellationToken);

        var taskTypeIds = saveFeRequisitionDto.FeGeneralTasks
            .Select(x => x.FeTaskTypeId)
            .Distinct()
            .ToList();

        var taskTypes = await context.FeTaskTypes
            .Where(x => taskTypeIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        var taskTypeMap =
            taskTypes.ToDictionary(x => x.Id);

        var requisitionNumber = await context.NextFeRequisitionNumberAsync(cancellationToken);

        var requisition = FeRequisitionMapper.MapSaveRequisitionDtoToRequisition(
                saveFeRequisitionDto,
                requisitionNumber,
                driverSummary,
                shop,
                taskTypeMap);

        requisition.RecalculateSubtotal();

        context.FeRequisitions.Add(requisition);
        await context.SaveChangesAsync(cancellationToken);

        return FeRequisitionMapper.MapRequisitionToDetailDto(requisition, driverSummary);
    }

    public async Task<FeRequisitionDetailDto> UpdateAsync(
        Guid id,
        SaveFeRequisitionDto saveFeRequisitionDto,
        CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(saveFeRequisitionDto, cancellationToken);

        var existingRequisition = await LoadFullAsync(id, cancellationToken)
                                  ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        context.Entry(existingRequisition)
            .Property(nameof(FeRequisition.RowVersion))
            .OriginalValue = saveFeRequisitionDto.RowVersion;

        var driverSummary = await context.VanDrivers
            .Where(x => x.Id == saveFeRequisitionDto.VanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);

        var shop = await context.Shops.SingleAsync(x => x.Id == saveFeRequisitionDto.ShopId, cancellationToken);

        var taskTypeIds = saveFeRequisitionDto.FeGeneralTasks
                .Select(x => x.FeTaskTypeId)
                .Distinct()
                .ToList();

        var taskTypes = await context.FeTaskTypes
                .Where(x => taskTypeIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

        var taskTypeMap = taskTypes.ToDictionary(x => x.Id);

        existingRequisition.UpdateDetails(
            saveFeRequisitionDto.RequisitionDate,
            driverSummary.Id,
            saveFeRequisitionDto.VanDriverName.Trim(),
            driverSummary.Code,
            driverSummary.TradersName,
            shop.Id,
            shop.Code,
            shop.Name,
            driverSummary.HasVat);

        var existingTasks = existingRequisition.FeGeneralTasks
            .ToDictionary(x => x.Id);

        var incomingIds = saveFeRequisitionDto.FeGeneralTasks
            .Where(x => x.Id.HasValue)
            .Select(x => x.Id!.Value)
            .ToHashSet();

        var tasksToDelete = existingRequisition.FeGeneralTasks
            .Where(x => !incomingIds.Contains(x.Id))
            .ToList();

        foreach (var task in tasksToDelete)
        {
            existingRequisition.FeGeneralTasks.Remove(task);
        }

        foreach (var dtoTask in saveFeRequisitionDto.FeGeneralTasks.Where(x => x.Id.HasValue))
        {
            if (!existingTasks.TryGetValue(dtoTask.Id!.Value, out var task))
            {
                throw new ValidationException(
                    $"Task '{dtoTask.Id}' was not found on requisition '{id}'.");
            }

            task.Update(
                dtoTask.WeekEndingDate,
                new WeeklyQuantities(
                    dtoTask.Week.Sunday,
                    dtoTask.Week.Monday,
                    dtoTask.Week.Tuesday,
                    dtoTask.Week.Wednesday,
                    dtoTask.Week.Thursday,
                    dtoTask.Week.Friday,
                    dtoTask.Week.Saturday),
                dtoTask.RatePerJob);
        }

        foreach (var dtoTask in saveFeRequisitionDto.FeGeneralTasks.Where(x => !x.Id.HasValue))
        {
            var taskType = taskTypeMap[dtoTask.FeTaskTypeId];

            var task = new FeGeneralTask(
                taskType.Id,
                taskType.Name,
                taskType.Code,
                dtoTask.WeekEndingDate,
                new WeeklyQuantities(
                    dtoTask.Week.Sunday,
                    dtoTask.Week.Monday,
                    dtoTask.Week.Tuesday,
                    dtoTask.Week.Wednesday,
                    dtoTask.Week.Thursday,
                    dtoTask.Week.Friday,
                    dtoTask.Week.Saturday),
                dtoTask.RatePerJob);

            existingRequisition.FeGeneralTasks.Add(task);
            context.FeGeneralTasks.Add(task);
            Console.WriteLine(context.Entry(task).State);
        }

        existingRequisition.RecalculateSubtotal();

        foreach (var task in existingRequisition.FeGeneralTasks)
        {
            Console.WriteLine(
                $"Task {task.Id}");
        }

        foreach (var task in existingRequisition.FeGeneralTasks)
        {
            var state = context.Entry(task).State;

            Console.WriteLine(
                $"Task: {task.Id} State: {state}");
        }

        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            foreach (var entry in ex.Entries)
            {
                Console.WriteLine(
                    $"Concurrency entity: {entry.Entity.GetType().Name}");
            }

            throw;
        }

        return FeRequisitionMapper.MapRequisitionToDetailDto(existingRequisition, driverSummary);
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
}