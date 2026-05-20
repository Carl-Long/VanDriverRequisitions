using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public class FeRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser,
    IValidatorService validator) : IFeRequisitionService
{
    public async Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(
        FeRequisitionQueryDto query,
        CancellationToken cancellationToken = default)
    {
        IQueryable<FeRequisition> dbQuery = context.Requisitions;

        if (query.CreatedByMe)
        {
            var userId = currentUser.User.Id;
            dbQuery = dbQuery.Where(x => x.CreatedById == userId);
        }

        if (!string.IsNullOrWhiteSpace(query.RequisitionNumber))
        {
            var search = query.RequisitionNumber.Trim();
            dbQuery = dbQuery.Where(x => x.RequisitionNumber.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Status)
            && Enum.TryParse<RequisitionStatus>(query.Status, ignoreCase: true, out var statusEnum))
        {
            dbQuery = dbQuery.Where(x => x.Status == statusEnum);
        }

        if (query.ShopId.HasValue)
        {
            dbQuery = dbQuery.Where(x => x.ShopId == query.ShopId.Value);
        }

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .OrderByDescending(x => x.RequisitionDate)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(FeRequisitionProjections.AsSummaryDto)
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

        var shopLookup = await LoadShopLookupAsync(requisition, cancellationToken);
        return FeRequisitionMapper.ToDetailDto(requisition, shopLookup);
    }

    public async Task<FeRequisitionDetailDto> CreateAsync(SaveFeRequisitionDto dto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(dto, cancellationToken);

        var driver = await LoadDriverAsync(dto.VanDriverId, cancellationToken);
        var shop = await LoadShopAsync(dto.ShopId, cancellationToken);
        var taskTypes = await LoadTaskTypesAsync(dto.FeGeneralTasks.Select(x => x.FeTaskTypeId).Distinct().ToList(), cancellationToken);
        var reasons = await LoadReasonsAsync(dto.FeAdditionalCosts.Select(x => x.ReasonId).Distinct().ToList(), cancellationToken);
        await EnsureTransferShopsExistAsync(dto.FeTransfers, cancellationToken);

        var requisitionNumber = await context.NextFeRequisitionNumberAsync(cancellationToken);

        var requisition = new FeRequisition
        {
            RequisitionNumber = requisitionNumber,
            RequisitionDate = dto.RequisitionDate,
            VanDriverId = driver.Id,
            VanDriverCode = driver.Code,
            VanDriverName = dto.VanDriverName.Trim(),
            TradersName = driver.TradersName,
            ShopId = shop.Id,
            ShopCode = shop.Code,
            ShopName = shop.Name,
            Status = RequisitionStatus.Draft,
            IsVatApplicable = dto.IsVatApplicable,
            PoNumber = dto.PoNumber,
        };

        ApplyChildren(requisition, dto, taskTypes, reasons);
        requisition.Subtotal = requisition.CalculateSubtotal();

        context.Requisitions.Add(requisition);
        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> UpdateAsync(Guid id, SaveFeRequisitionDto dto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(dto, cancellationToken);

        var requisition = await LoadFullAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        EnsureEditable(requisition);

        var driver = await LoadDriverAsync(dto.VanDriverId, cancellationToken);
        var shop = await LoadShopAsync(dto.ShopId, cancellationToken);
        var taskTypes = await LoadTaskTypesAsync(dto.FeGeneralTasks.Select(x => x.FeTaskTypeId).Distinct().ToList(), cancellationToken);
        var reasons = await LoadReasonsAsync(dto.FeAdditionalCosts.Select(x => x.ReasonId).Distinct().ToList(), cancellationToken);
        await EnsureTransferShopsExistAsync(dto.FeTransfers, cancellationToken);

        requisition.RequisitionDate = dto.RequisitionDate;
        requisition.VanDriverId = driver.Id;
        requisition.VanDriverCode = driver.Code;
        requisition.VanDriverName = dto.VanDriverName.Trim();
        requisition.TradersName = driver.TradersName;
        requisition.ShopId = shop.Id;
        requisition.ShopCode = shop.Code;
        requisition.ShopName = shop.Name;
        requisition.IsVatApplicable = dto.IsVatApplicable;
        requisition.PoNumber = dto.PoNumber;

        requisition.FeGeneralTasks.Clear();
        requisition.FeMileages.Clear();
        requisition.FeTransfers.Clear();
        requisition.FeAdditionalCosts.Clear();

        ApplyChildren(requisition, dto, taskTypes, reasons);
        requisition.Subtotal = requisition.CalculateSubtotal();

        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<FeRequisitionDetailDto> SubmitAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var requisition = await context.Requisitions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException($"Requisition with ID '{id}' was not found.");

        EnsureEditable(requisition);

        if (requisition.Subtotal <= 0m)
            throw new BadRequestException("Cannot submit a requisition with a subtotal of zero or less.");

        var now = DateTime.UtcNow;
        var currentWindowOpen = await context.SubmitWindows
            .AnyAsync(w => w.OpenFrom <= now && w.OpenTo >= now, cancellationToken);

        if (!currentWindowOpen)
            throw new BadRequestException("There is no open submission window. Requisitions cannot be submitted at this time.");

        requisition.Status = RequisitionStatus.Submitted;
        requisition.SubmittedById = currentUser.User.Id;
        requisition.SubmittedAtUtc = now;

        await context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(requisition.Id, cancellationToken);
    }

    private async Task<FeRequisition?> LoadFullAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.Requisitions
            .Include(x => x.FeGeneralTasks)
            .Include(x => x.FeMileages)
            .Include(x => x.FeTransfers)
            .Include(x => x.FeAdditionalCosts)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<IReadOnlyDictionary<Guid, (string Code, string Name)>> LoadShopLookupAsync(
        FeRequisition requisition, CancellationToken cancellationToken)
    {
        var ids = requisition.FeTransfers
            .SelectMany(t => new[] { t.ShopIdFrom, t.ShopIdTo })
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return new Dictionary<Guid, (string Code, string Name)>();

        var rows = await context.Shops
            .IgnoreQueryFilters()
            .Where(s => ids.Contains(s.Id))
            .Select(s => new { s.Id, s.Code, s.Name })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(r => r.Id, r => (r.Code, r.Name));
    }

    private async Task<VanDriver> LoadDriverAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.VanDrivers.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException($"Van driver with ID '{id}' was not found.");
    }

    private async Task<Shop> LoadShopAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.Shops.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException($"Shop with ID '{id}' was not found.");
    }

    private async Task<IReadOnlyDictionary<Guid, FeTaskType>> LoadTaskTypesAsync(
        IReadOnlyList<Guid> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
            return new Dictionary<Guid, FeTaskType>();

        var items = await context.FeTaskTypes
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);

        var missing = ids.Except(items.Select(x => x.Id)).ToList();
        if (missing.Count > 0)
            throw new NotFoundException($"Task type(s) not found: {string.Join(", ", missing)}");

        return items.ToDictionary(x => x.Id);
    }

    private async Task<IReadOnlyDictionary<Guid, FeReason>> LoadReasonsAsync(
        IReadOnlyList<Guid> ids, CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
            return new Dictionary<Guid, FeReason>();

        var items = await context.FeReasons
            .Where(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);

        var missing = ids.Except(items.Select(x => x.Id)).ToList();
        if (missing.Count > 0)
            throw new NotFoundException($"Reason(s) not found: {string.Join(", ", missing)}");

        return items.ToDictionary(x => x.Id);
    }

    private async Task EnsureTransferShopsExistAsync(
        IReadOnlyList<SaveFeTransferDto> transfers, CancellationToken cancellationToken)
    {
        var ids = transfers
            .SelectMany(t => new[] { t.ShopIdFrom, t.ShopIdTo })
            .Where(id => id != Guid.Empty)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return;

        var existing = await context.Shops
            .Where(s => ids.Contains(s.Id))
            .Select(s => s.Id)
            .ToListAsync(cancellationToken);

        var missing = ids.Except(existing).ToList();
        if (missing.Count > 0)
            throw new NotFoundException($"Shop(s) not found: {string.Join(", ", missing)}");
    }

    private static void EnsureEditable(FeRequisition requisition)
    {
        if (!FeRequisitionMapper.IsEditable(requisition.Status))
            throw new BadRequestException(
                $"Requisition is currently '{requisition.Status}' and cannot be modified.");
    }

    private static void ApplyChildren(
        FeRequisition requisition,
        SaveFeRequisitionDto dto,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypes,
        IReadOnlyDictionary<Guid, FeReason> reasons)
    {
        foreach (var t in dto.FeGeneralTasks)
        {
            var type = taskTypes[t.FeTaskTypeId];
            var entity = new FeGeneralTask(FeRequisitionMapper.ToDomain(t.Week))
            {
                FeTaskTypeId = type.Id,
                TaskTypeName = type.Name,
                TaskTypeCode = type.Code,
                WeekEndingDate = t.WeekEndingDate,
            };
            entity.SetRate(t.RatePerJob);
            requisition.FeGeneralTasks.Add(entity);
        }

        foreach (var m in dto.FeMileages)
        {
            var entity = new FeMileage(FeRequisitionMapper.ToDomain(m.Week))
            {
                WeekEndingDate = m.WeekEndingDate,
            };
            entity.SetRate(m.RatePerMile);
            requisition.FeMileages.Add(entity);
        }

        foreach (var tr in dto.FeTransfers)
        {
            var entity = new FeTransfer(FeRequisitionMapper.ToDomain(tr.Week))
            {
                WeekEndingDate = tr.WeekEndingDate,
                ShopIdFrom = tr.ShopIdFrom,
                ShopIdTo = tr.ShopIdTo,
            };
            entity.SetRate(tr.RatePerJob);
            requisition.FeTransfers.Add(entity);
        }

        foreach (var c in dto.FeAdditionalCosts)
        {
            var reason = reasons[c.ReasonId];
            var entity = new FeAdditionalCost
            {
                ReasonId = reason.Id,
                ReasonText = reason.Reason,
                WeekEndingDate = c.WeekEndingDate,
            };

            if (c.ChargingOption == ChargingOption.Mileage)
            {
                entity.SetMiles(c.Miles ?? 0, c.RatePerMile ?? 0m);
            }
            else
            {
                entity.SetJobs(c.TotalNumber ?? 0, c.RatePerJob ?? 0m);
            }

            requisition.FeAdditionalCosts.Add(entity);
        }
    }
}
