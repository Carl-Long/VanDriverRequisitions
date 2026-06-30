using FluentValidation;
using FluentValidation.Results;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Requisitions;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.StdRequisitions.Models;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Builders;

public sealed class StdRequisitionSaveDataBuilder(IRequisitionLookupLoader lookupLoader) : IStdRequisitionSaveDataBuilder
{
    public async Task<StdRequisitionSaveData> BuildAsync(
        SaveStdRequisitionDto saveStdRequisitionDto,
        StdRequisition? existingRequisition,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(saveStdRequisitionDto);

        var existingLookupMaps = BuildExistingLookupMaps(existingRequisition);

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(
            saveStdRequisitionDto.VanDriverId,
            cancellationToken,
            includeInactive: true);

        var shop = await lookupLoader.LoadShopRequisitionSnapshotAsync(
            saveStdRequisitionDto.ShopId,
            cancellationToken,
            includeInactive: true);

        var details = StdRequisitionMapper.MapToRequisitionDetails(saveStdRequisitionDto, driverSummary, shop);

        var collectionChargeModels = await BuildCollectionChargeModelsAsync(
            saveStdRequisitionDto.CollectionChargesBanksAndBins,
            existingLookupMaps.CollectionTypeIdByCollectionChargeId,
            existingLookupMaps.LocationIdByCollectionChargeId,
            cancellationToken);

        var collectionVanPacks = await BuildCollectionVanPackModelsAsync(
            saveStdRequisitionDto.CollectionVanPacks,
            cancellationToken);

        var pickups = BuildPickupModels(saveStdRequisitionDto.Pickups);

        var transfers = await BuildTransferModelsAsync(
            saveStdRequisitionDto.Transfers,
            existingLookupMaps.FromShopIdByTransferId,
            existingLookupMaps.ToShopIdByTransferId,
            cancellationToken);

        var additionalCosts = await BuildAdditionalCostModelsAsync(
            saveStdRequisitionDto.AdditionalCosts,
            existingLookupMaps.ReasonIdByAdditionalCostId,
            cancellationToken);

        var updateModel = new StdRequisitionUpdateModel(
            details,
            Pickups: pickups,
            Transfers: transfers,
            CollectionChargesBanksAndBins: collectionChargeModels,
            CollectionVanPacks: collectionVanPacks,
            AdditionalCosts: additionalCosts);

        return new StdRequisitionSaveData(driverSummary, updateModel, shop.IsActive);
    }

    private static ExistingStdLookupMaps BuildExistingLookupMaps(StdRequisition? existingRequisition)
    {
        if (existingRequisition is null)
        {
            return ExistingStdLookupMaps.Empty;
        }

        return new ExistingStdLookupMaps(
            existingRequisition.Transfers.ToDictionary(
                x => x.Id,
                x => x.ShopIdFrom),
            existingRequisition.Transfers.ToDictionary(
                x => x.Id,
                x => x.ShopIdTo),
            existingRequisition.CollectionChargesBanksAndBins.ToDictionary(
                x => x.Id,
                x => x.CollectionTypeId),
            existingRequisition.CollectionChargesBanksAndBins.ToDictionary(
                x => x.Id,
                x => x.LocationId),
            existingRequisition.AdditionalCosts.ToDictionary(
                x => x.Id,
                x => x.ReasonId));
    }

    private async Task<List<StdCollectionChargeBanksAndBinsUpdateModel>> BuildCollectionChargeModelsAsync(
        IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto> collectionCharges,
        IReadOnlyDictionary<Guid, Guid> existingCollectionTypeIdByCollectionChargeId,
        IReadOnlyDictionary<Guid, Guid> existingLocationIdByCollectionChargeId,
        CancellationToken cancellationToken)
    {
        if (collectionCharges.Count == 0)
        {
            return [];
        }

        var collectionTypeMap = await lookupLoader.LoadStdCollectionTypeMapAsync(
            collectionCharges.Select(x => x.CollectionTypeId),
            cancellationToken,
            includeInactive: true);

        var locationMap = await lookupLoader.LoadStdLocationMapAsync(
            collectionCharges.Select(x => x.LocationId),
            cancellationToken,
            includeInactive: true);

        return collectionCharges
            .Select(dto =>
            {
                var collectionType = MapCollectionType(
                    dto.CollectionTypeId,
                    collectionTypeMap,
                    dto.Id,
                    existingCollectionTypeIdByCollectionChargeId);

                var location = MapLocation(
                    dto.LocationId,
                    locationMap,
                    dto.Id,
                    existingLocationIdByCollectionChargeId);

                return StdCollectionChargeBanksAndBinsMapper.ToUpdateModel(dto, collectionType, location);
            })
            .ToList();
    }

    private async Task<List<StdCollectionVanPackUpdateModel>> BuildCollectionVanPackModelsAsync(
        IReadOnlyCollection<SaveStdCollectionVanPackDto> collectionVanPacks,
        CancellationToken cancellationToken)
    {
        if (collectionVanPacks.Count == 0)
        {
            return [];
        }

        var vanPackRate = await GetRequiredVanPackRateAsync(cancellationToken);

        return collectionVanPacks
            .Select(x => StdCollectionVanPackMapper.ToUpdateModel(x, vanPackRate))
            .ToList();
    }

    private static List<StdPickupUpdateModel> BuildPickupModels(IReadOnlyCollection<SaveStdPickupDto> pickups)
    {
        return pickups.Select(StdPickupMapper.ToUpdateModel).ToList();
    }

    private async Task<List<StdTransferUpdateModel>> BuildTransferModelsAsync(
        IReadOnlyCollection<SaveStdTransferDto> transfers,
        IReadOnlyDictionary<Guid, Guid> existingFromShopIdByTransferId,
        IReadOnlyDictionary<Guid, Guid> existingToShopIdByTransferId,
        CancellationToken cancellationToken)
    {
        if (transfers.Count == 0)
        {
            return [];
        }

        var transferShopIds = transfers
            .SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo });

        var transferShopMap = await lookupLoader.LoadShopRequisitionSnapshotMapAsync(
            transferShopIds,
            cancellationToken,
            includeInactive: true);

        return transfers
            .Select(dto =>
            {
                var fromShop = MapTransferShop(dto.ShopIdFrom, transferShopMap, dto.Id, existingFromShopIdByTransferId, "From");
                var toShop = MapTransferShop(dto.ShopIdTo, transferShopMap, dto.Id, existingToShopIdByTransferId, "To");
                return StdTransferMapper.ToUpdateModel(dto, fromShop, toShop);
            })
            .ToList();
    }

    private async Task<List<StdAdditionalCostUpdateModel>> BuildAdditionalCostModelsAsync(
        IReadOnlyCollection<SaveStdAdditionalCostDto> additionalCosts,
        IReadOnlyDictionary<Guid, Guid> existingReasonIdByAdditionalCostId,
        CancellationToken cancellationToken)
    {
        if (additionalCosts.Count == 0)
        {
            return [];
        }

        var reasonMap = await lookupLoader.LoadCostReasonMapAsync(
            additionalCosts.Select(x => x.ReasonId),
            cancellationToken,
            includeInactive: true);

        return additionalCosts
            .Select(dto =>
            {
                var reason = MapAdditionalCostReason(
                    dto.ReasonId,
                    reasonMap,
                    dto.Id,
                    existingReasonIdByAdditionalCostId);

                return StdAdditionalCostMapper.ToUpdateModel(
                    dto,
                    reason);
            })
            .ToList();
    }

    private static CostReason MapAdditionalCostReason(
        Guid reasonId,
        IReadOnlyDictionary<Guid, CostReason> reasonMap,
        Guid? rowId,
        IReadOnlyDictionary<Guid, Guid> existingReasonIdByAdditionalCostId)
    {
        if (!reasonMap.TryGetValue(reasonId, out var reason))
        {
            throw new NotFoundException($"Additional cost reason '{reasonId}' was not found.");
        }

        if (!reason.AppliesToStd())
        {
            throw new BadRequestException(
                $"Additional cost reason '{reason.Code} - {reason.Reason}' is not valid for STD requisitions.");
        }

        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
            rowId,
            reasonId,
            reason.IsActive,
            existingReasonIdByAdditionalCostId,
            $"Additional cost reason '{reason.Code} - {reason.Reason}'");

        return reason;
    }

    private static StdCollectionType MapCollectionType(
        Guid collectionTypeId,
        IReadOnlyDictionary<Guid, StdCollectionType> collectionTypeMap,
        Guid? rowId,
        IReadOnlyDictionary<Guid, Guid> existingCollectionTypeIdByCollectionChargeId)
    {
        if (!collectionTypeMap.TryGetValue(collectionTypeId, out var collectionType))
        {
            throw new NotFoundException($"STD collection type '{collectionTypeId}' was not found.");
        }

        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
            rowId,
            collectionTypeId,
            collectionType.IsActive,
            existingCollectionTypeIdByCollectionChargeId,
            $"STD collection type '{collectionType.Code} - {collectionType.Name}'");

        return collectionType;
    }

    private static StdLocation MapLocation(
        Guid locationId,
        IReadOnlyDictionary<Guid, StdLocation> locationMap,
        Guid? rowId,
        IReadOnlyDictionary<Guid, Guid> existingLocationIdByCollectionChargeId)
    {
        if (!locationMap.TryGetValue(locationId, out var location))
        {
            throw new NotFoundException($"STD location '{locationId}' was not found.");
        }

        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
            rowId,
            locationId,
            location.IsActive,
            existingLocationIdByCollectionChargeId,
            $"STD location '{location.LocationName}'");

        return location;
    }

    private static ShopSnapshot MapTransferShop(
        Guid shopId,
        IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> transferShops,
        Guid? rowId,
        IReadOnlyDictionary<Guid, Guid> existingShopIdByTransferId,
        string direction)
    {
        if (!transferShops.TryGetValue(shopId, out var shop))
        {
            throw new NotFoundException($"Shop '{shopId}' was not found.");
        }

        InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
            rowId,
            shopId,
            shop.IsActive,
            existingShopIdByTransferId,
            $"{direction} shop '{shop.Code} - {shop.Name}'");

        return new ShopSnapshot(shop.Id, shop.Code, shop.Name);
    }

    private async Task<decimal> GetRequiredVanPackRateAsync(CancellationToken cancellationToken)
    {
        var vanPackRate = await lookupLoader.LoadStdVanPackRateAsync(cancellationToken);

        if (vanPackRate is null)
        {
            throw new ValidationException(
            [
                new ValidationFailure(
                    nameof(SaveStdRequisitionDto.CollectionVanPacks),
                    "No STD van pack pricing rule is configured. Please contact an administrator.")
            ]);
        }

        return vanPackRate.Value;
    }

    private sealed record ExistingStdLookupMaps(
        IReadOnlyDictionary<Guid, Guid> FromShopIdByTransferId,
        IReadOnlyDictionary<Guid, Guid> ToShopIdByTransferId,
        IReadOnlyDictionary<Guid, Guid> CollectionTypeIdByCollectionChargeId,
        IReadOnlyDictionary<Guid, Guid> LocationIdByCollectionChargeId,
        IReadOnlyDictionary<Guid, Guid> ReasonIdByAdditionalCostId)
    {
        public static ExistingStdLookupMaps Empty { get; } = new(
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>(),
            new Dictionary<Guid, Guid>());
    }
}