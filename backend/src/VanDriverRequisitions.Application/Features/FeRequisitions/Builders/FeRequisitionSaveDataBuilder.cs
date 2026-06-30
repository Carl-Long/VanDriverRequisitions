using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Requisitions;
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
    public async Task<FeRequisitionSaveData> BuildAsync(SaveFeRequisitionDto saveFeRequisitionDto, FeRequisition? existingRequisition, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(saveFeRequisitionDto);

        var existingLookupMaps = BuildExistingLookupMaps(existingRequisition);

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(saveFeRequisitionDto.VanDriverId,
            cancellationToken, includeInactive: true);

        var shop = await lookupLoader.LoadShopRequisitionSnapshotAsync(saveFeRequisitionDto.ShopId, cancellationToken,
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

        var details = FeRequisitionMapper.MapToRequisitionDetails(
            saveFeRequisitionDto,
            driverSummary,
            shop);

        var taskModels = BuildGeneralTaskModels(
            saveFeRequisitionDto.FeGeneralTasks,
            taskTypeMap,
            existingLookupMaps.TaskTypeIdByGeneralTaskId);

        var mileageModels = BuildMileageModels(
            saveFeRequisitionDto.FeMileages);

        var transferModels = BuildTransferModels(
            saveFeRequisitionDto.FeTransfers,
            transferShopMap,
            existingLookupMaps.FromShopIdByTransferId,
            existingLookupMaps.ToShopIdByTransferId);

        var additionalCostModels = BuildAdditionalCostModels(
            saveFeRequisitionDto.FeAdditionalCosts,
            reasonMap,
            existingLookupMaps.ReasonIdByAdditionalCostId);

        var updateModel = new FeRequisitionUpdateModel(details, taskModels, mileageModels, transferModels, additionalCostModels);

        return new FeRequisitionSaveData(driverSummary, updateModel, shop.IsActive);
    }

    private static ExistingFeLookupMaps BuildExistingLookupMaps(FeRequisition? existingRequisition)
    {
        if (existingRequisition is null)
        {
            return ExistingFeLookupMaps.Empty;
        }

        return new ExistingFeLookupMaps(
            existingRequisition.FeGeneralTasks.ToDictionary(x => x.Id, x => x.FeTaskTypeId),
            existingRequisition.FeTransfers.ToDictionary(x => x.Id, x => x.ShopIdFrom),
            existingRequisition.FeTransfers.ToDictionary(x => x.Id, x => x.ShopIdTo),
            existingRequisition.FeAdditionalCosts.ToDictionary(x => x.Id, x => x.ReasonId)
            );
    }

    private static List<FeGeneralTaskUpdateModel> BuildGeneralTaskModels(
        IEnumerable<SaveFeGeneralTaskDto> tasks,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypeMap,
        IReadOnlyDictionary<Guid, Guid> existingTaskTypeIdByGeneralTaskId)
    {
        return tasks
            .Select(dto =>
            {
                if (!taskTypeMap.TryGetValue(dto.FeTaskTypeId, out var taskType))
                {
                    throw new NotFoundException($"Task type '{dto.FeTaskTypeId}' was not found.");
                }

                InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                    dto.Id,
                    dto.FeTaskTypeId,
                    taskType.IsActive,
                    existingTaskTypeIdByGeneralTaskId,
                    $"Task type '{taskType.Code} - {taskType.Name}'");

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
        IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> shopMap,
        IReadOnlyDictionary<Guid, Guid> existingFromShopIdByTransferId,
        IReadOnlyDictionary<Guid, Guid> existingToShopIdByTransferId)
    {
        return transfers
            .Select(dto =>
            {
                var fromShop = MapShopSnapshot(dto.ShopIdFrom, shopMap, dto.Id, existingFromShopIdByTransferId, "From");
                var toShop = MapShopSnapshot(dto.ShopIdTo, shopMap, dto.Id, existingToShopIdByTransferId, "To");
                return FeTransferMapper.ToUpdateModel(dto, fromShop, toShop);
            })
            .ToList();
    }

    private static List<FeAdditionalCostUpdateModel> BuildAdditionalCostModels(
        IEnumerable<SaveFeAdditionalCostDto> additionalCosts,
        IReadOnlyDictionary<Guid, CostReason> reasonMap,
        IReadOnlyDictionary<Guid, Guid> existingReasonIdByAdditionalCostId)
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

                InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                    dto.Id,
                    dto.ReasonId,
                    reason.IsActive,
                    existingReasonIdByAdditionalCostId,
                    $"Additional cost reason '{reason.Code} - {reason.Reason}'");

                return FeAdditionalCostMapper.ToUpdateModel(dto, reason);
            })
            .ToList();
    }

    private static ShopSnapshot MapShopSnapshot(
        Guid shopId,
        IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> shopMap,
        Guid? rowId,
        IReadOnlyDictionary<Guid, Guid> existingShopIdByTransferId,
        string direction)
    {
        if (!shopMap.TryGetValue(shopId, out var shop))
        {
            throw new NotFoundException($"Shop '{shopId}' was not found.");
        }

        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(rowId, shopId, shop.IsActive, existingShopIdByTransferId, $"{direction} shop '{shop.Code} - {shop.Name}'");

        return new ShopSnapshot(shop.Id, shop.Code, shop.Name);
    }

    private sealed record ExistingFeLookupMaps(
        IReadOnlyDictionary<Guid, Guid> TaskTypeIdByGeneralTaskId,
        IReadOnlyDictionary<Guid, Guid> FromShopIdByTransferId,
        IReadOnlyDictionary<Guid, Guid> ToShopIdByTransferId,
        IReadOnlyDictionary<Guid, Guid> ReasonIdByAdditionalCostId)
    {
        public static ExistingFeLookupMaps Empty { get; } = new(
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>());
    }
}