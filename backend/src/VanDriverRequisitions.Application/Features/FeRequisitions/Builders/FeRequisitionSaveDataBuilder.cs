using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.FeRequisitions.Models;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Mappings;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Builders;

public sealed class FeRequisitionSaveDataBuilder(IApplicationDbContext context) : IFeRequisitionSaveDataBuilder
{
    public async Task<FeRequisitionSaveData> BuildAsync(SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(saveFeRequisitionDto);

        var driverSummary = await LoadDriverSummaryAsync(saveFeRequisitionDto.VanDriverId, cancellationToken);
        var shop = await LoadShopSnapshotAsync(saveFeRequisitionDto.ShopId, cancellationToken);
        var taskTypeMap = await LoadTaskTypeMapAsync(saveFeRequisitionDto.FeGeneralTasks, cancellationToken);
        var transferShopMap = await LoadTransferShopMapAsync(saveFeRequisitionDto.FeTransfers, cancellationToken);
        var reasonMap = await LoadReasonMapAsync(saveFeRequisitionDto.FeAdditionalCosts, cancellationToken);

        var details = FeRequisitionMapper.MapToRequisitionDetails(saveFeRequisitionDto, driverSummary, shop);

        var taskModels = BuildGeneralTaskModels(saveFeRequisitionDto.FeGeneralTasks, taskTypeMap);
        var mileageModels = BuildMileageModels(saveFeRequisitionDto.FeMileages);
        var transferModels = BuildTransferModels(saveFeRequisitionDto.FeTransfers, transferShopMap);
        var additionalCostModels = BuildAdditionalCostModels(saveFeRequisitionDto.FeAdditionalCosts, reasonMap);

        var updateModel = new FeRequisitionUpdateModel(details, taskModels, mileageModels, transferModels, additionalCostModels);

        return new FeRequisitionSaveData(driverSummary, updateModel, shop.IsActive);
    }

    private async Task<VanDriverLookupDto> LoadDriverSummaryAsync(Guid vanDriverId, CancellationToken cancellationToken)
    {
        var driver = await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == vanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleOrDefaultAsync(cancellationToken);

        return driver ?? throw new NotFoundException($"Van driver '{vanDriverId}' was not found.");
    }

    private async Task<ShopRequisitionSnapshotDto> LoadShopSnapshotAsync(Guid shopId, CancellationToken cancellationToken)
    {
        var shop = await context.Shops
            .AsNoTracking()
            .Where(x => x.Id == shopId)
            .Select(ShopProjections.AsRequisitionSnapshotDto)
            .SingleOrDefaultAsync(cancellationToken);

        return shop ?? throw new NotFoundException($"Shop '{shopId}' was not found.");
    }
    
    private async Task<Dictionary<Guid, FeTaskType>> LoadTaskTypeMapAsync(IEnumerable<SaveFeGeneralTaskDto> tasks, CancellationToken cancellationToken)
    {
        var taskTypeIds = tasks
            .Select(x => x.FeTaskTypeId)
            .Distinct()
            .ToList();

        return await context.FeTaskTypes
            .IgnoreQueryFilters()
            .Where(x => taskTypeIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private async Task<Dictionary<Guid, ShopRequisitionSnapshotDto>> LoadTransferShopMapAsync(IEnumerable<SaveFeTransferDto> transfers, CancellationToken cancellationToken)
    {
        var transferShopIds = transfers
            .SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo })
            .Distinct()
            .ToList();

        return await context.Shops
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => transferShopIds.Contains(x.Id))
            .Select(ShopProjections.AsRequisitionSnapshotDto)
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private async Task<Dictionary<Guid, CostReason>> LoadReasonMapAsync(
        IEnumerable<SaveFeAdditionalCostDto> additionalCosts,
        CancellationToken cancellationToken)
    {
        var reasonIds = additionalCosts
            .Select(x => x.ReasonId)
            .Distinct()
            .ToList();

        return await context.CostReasons
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => reasonIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private static List<FeGeneralTaskUpdateModel> BuildGeneralTaskModels(IEnumerable<SaveFeGeneralTaskDto> tasks, IReadOnlyDictionary<Guid, FeTaskType> taskTypeMap)
    {
        return tasks
            .Select(dto =>
            {
                if (!taskTypeMap.TryGetValue(dto.FeTaskTypeId, out var taskType))
                {
                    throw new NotFoundException($"Task type '{dto.FeTaskTypeId}' was not found.");
                }

                if (!taskType.IsActive && dto.Id is null)
                {
                    throw new BadRequestException($"Task type '{taskType.Code} - {taskType.Name}' is inactive and cannot be added to a requisition.");
                }

                return FeGeneralTaskMapper.ToUpdateModel(dto, taskType);
            })
            .ToList();
    }

    private static List<FeMileageUpdateModel> BuildMileageModels(IEnumerable<SaveFeMileageDto> mileages)
    {
        return mileages.Select(FeMileageMapper.ToUpdateModel).ToList();
    }

    private static List<FeTransferUpdateModel> BuildTransferModels(
        IEnumerable<SaveFeTransferDto> transfers,
        IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> shopMap)
    {
        return transfers
            .Select(dto =>
            {
                var fromShop = MapShopSnapshot(dto.ShopIdFrom, shopMap);
                var toShop = MapShopSnapshot(dto.ShopIdTo, shopMap);

                return FeTransferMapper.ToUpdateModel(dto, fromShop, toShop);
            })
            .ToList();
    }

    private static List<FeAdditionalCostUpdateModel> BuildAdditionalCostModels(
        IEnumerable<SaveFeAdditionalCostDto> additionalCosts,
        IReadOnlyDictionary<Guid, CostReason> reasonMap)
    {
        {
            return additionalCosts
                .Select(dto =>
                {
                    if (!reasonMap.TryGetValue(dto.ReasonId, out var reason))
                    {
                        throw new NotFoundException($"Additional cost reason '{dto.ReasonId}' was not found.");
                    }

                    if (reason.Scope is not CostReasonScope.Fe and not CostReasonScope.Shared)
                    {
                        throw new BadRequestException(
                            $"Additional cost reason '{reason.Code} - {reason.Reason}' is not valid for FE requisitions.");
                    }

                    return FeAdditionalCostMapper.ToUpdateModel(dto, reason);
                })
                .ToList();
        }
    }

    private static ShopSnapshot MapShopSnapshot(Guid shopId, IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> shopMap)
    {
        return !shopMap.TryGetValue(shopId, out var shop)
            ? throw new NotFoundException($"Shop '{shopId}' was not found.")
            : new ShopSnapshot(shop.Id, shop.Code, shop.Name);
    }
}