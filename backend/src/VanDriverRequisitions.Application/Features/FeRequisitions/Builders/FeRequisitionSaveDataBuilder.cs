using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.FeRequisitions.Models;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Builders;

public sealed class FeRequisitionSaveDataBuilder(IRequisitionLookupLoader lookupLoader) : IFeRequisitionSaveDataBuilder
{
    public async Task<FeRequisitionSaveData> BuildAsync(SaveFeRequisitionDto saveFeRequisitionDto,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(saveFeRequisitionDto);

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(saveFeRequisitionDto.VanDriverId,
            cancellationToken, includeInactive: true);

        var shop = await lookupLoader.LoadShopRequisitionSnapshotAsync(
            saveFeRequisitionDto.ShopId,
            cancellationToken,
            includeInactive: true);

        var taskTypeMap = await lookupLoader.LoadFeTaskTypeMapAsync(
            saveFeRequisitionDto.FeGeneralTasks.Select(x => x.FeTaskTypeId),
            cancellationToken,
            includeInactive: true);

        var transferShopIds = saveFeRequisitionDto.FeTransfers
            .SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo });

        var transferShopMap = await lookupLoader.LoadShopRequisitionSnapshotMapAsync(
            transferShopIds,
            cancellationToken,
            includeInactive: true);

        var reasonMap = await lookupLoader.LoadCostReasonMapAsync(
            saveFeRequisitionDto.FeAdditionalCosts.Select(x => x.ReasonId),
            cancellationToken,
            includeInactive: true);

        var details = FeRequisitionMapper.MapToRequisitionDetails(saveFeRequisitionDto, driverSummary, shop);

        var taskModels = BuildGeneralTaskModels(saveFeRequisitionDto.FeGeneralTasks, taskTypeMap);
        var mileageModels = BuildMileageModels(saveFeRequisitionDto.FeMileages);
        var transferModels = BuildTransferModels(saveFeRequisitionDto.FeTransfers, transferShopMap);
        var additionalCostModels = BuildAdditionalCostModels(saveFeRequisitionDto.FeAdditionalCosts, reasonMap);

        var updateModel = new FeRequisitionUpdateModel(
            details,
            taskModels,
            mileageModels,
            transferModels,
            additionalCostModels);

        return new FeRequisitionSaveData(driverSummary, updateModel, shop.IsActive);
    }

    private static List<FeGeneralTaskUpdateModel> BuildGeneralTaskModels(IEnumerable<SaveFeGeneralTaskDto> tasks,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypeMap)
    {
        return tasks
            .Select(dto =>
            {
                if (!taskTypeMap.TryGetValue(dto.FeTaskTypeId, out var taskType))
                {
                    throw new NotFoundException($"Task type '{dto.FeTaskTypeId}' was not found.");
                }

                EnsureActiveForNewRow(isActive: taskType.IsActive, rowId: dto.Id,
                    lookupDescription: $"Task type '{taskType.Code} - {taskType.Name}'");

                return FeGeneralTaskMapper.ToUpdateModel(dto, taskType);
            })
            .ToList();
    }

    private static List<FeMileageUpdateModel> BuildMileageModels(IEnumerable<SaveFeMileageDto> mileages)
    {
        return mileages.Select(FeMileageMapper.ToUpdateModel).ToList();
    }

    private static List<FeTransferUpdateModel> BuildTransferModels(IEnumerable<SaveFeTransferDto> transfers,
        IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> shopMap)
    {
        return transfers
            .Select(dto =>
            {
                var fromShop = MapShopSnapshot(dto.ShopIdFrom, shopMap, dto.Id, "From");
                var toShop = MapShopSnapshot(dto.ShopIdTo, shopMap, dto.Id, "To");

                return FeTransferMapper.ToUpdateModel(dto, fromShop, toShop);
            })
            .ToList();
    }

    private static List<FeAdditionalCostUpdateModel> BuildAdditionalCostModels(
        IEnumerable<SaveFeAdditionalCostDto> additionalCosts, IReadOnlyDictionary<Guid, CostReason> reasonMap)
    {
        return additionalCosts
            .Select(dto =>
            {
                if (!reasonMap.TryGetValue(dto.ReasonId, out var reason))
                {
                    throw new NotFoundException($"Additional cost reason '{dto.ReasonId}' was not found.");
                }

                if (!reason.AppliesToFe())
                {
                    throw new BadRequestException(
                        $"Additional cost reason '{reason.Code} - {reason.Reason}' is not valid for FE requisitions.");
                }

                EnsureActiveForNewRow(isActive: reason.IsActive, rowId: dto.Id,
                    lookupDescription: $"Additional cost reason '{reason.Code} - {reason.Reason}'");

                return FeAdditionalCostMapper.ToUpdateModel(dto, reason);
            })
            .ToList();
    }

    private static ShopSnapshot MapShopSnapshot(Guid shopId,
        IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> shopMap,
        Guid? rowId,
        string direction)
    {
        if (!shopMap.TryGetValue(shopId, out var shop))
        {
            throw new NotFoundException($"Shop '{shopId}' was not found.");
        }

        EnsureActiveForNewRow(isActive: shop.IsActive, rowId: rowId,
            lookupDescription: $"{direction} shop '{shop.Code} - {shop.Name}'");

        return new ShopSnapshot(shop.Id, shop.Code, shop.Name);
    }

    private static void EnsureActiveForNewRow(bool isActive, Guid? rowId, string lookupDescription)
    {
        if (!isActive && rowId is null)
        {
            throw new BadRequestException($"{lookupDescription} is inactive and cannot be added to a requisition.");
        }
    }
}