using FluentValidation;
using FluentValidation.Results;
using VanDriverRequisitions.Application.Common.Interfaces;
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
    public async Task<StdRequisitionSaveData> BuildAsync(SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(saveStdRequisitionDto);

        var driverSummary = await lookupLoader.LoadDriverLookupAsync(
            saveStdRequisitionDto.VanDriverId,
            cancellationToken,
            includeInactive: true);

        var shop = await lookupLoader.LoadShopRequisitionSnapshotAsync(
            saveStdRequisitionDto.ShopId,
            cancellationToken,
            includeInactive: true);

        var details = StdRequisitionMapper.MapToRequisitionDetails(
            saveStdRequisitionDto,
            driverSummary,
            shop);

        var collectionChargeModels = await BuildCollectionChargeModelsAsync(
            saveStdRequisitionDto.CollectionChargesBanksAndBins,
            cancellationToken);

        var collectionVanPacks = await BuildCollectionVanPackModelsAsync(
            saveStdRequisitionDto.CollectionVanPacks,
            cancellationToken);

        var pickups = BuildPickupModels(
            saveStdRequisitionDto.Pickups);

        var transfers = await BuildTransferModelsAsync(
            saveStdRequisitionDto.Transfers,
            cancellationToken);

        var additionalCosts = await BuildAdditionalCostModelsAsync(
            saveStdRequisitionDto.AdditionalCosts,
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

    private async Task<List<StdCollectionChargeBanksAndBinsUpdateModel>> BuildCollectionChargeModelsAsync(
        IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto> collectionCharges,
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
                var collectionType = MapCollectionType(dto.CollectionTypeId, collectionTypeMap, dto.Id);
                var location = MapLocation(dto.LocationId, locationMap, dto.Id);

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
        CancellationToken cancellationToken)
    {
        if (transfers.Count == 0)
        {
            return [];
        }

        var transferShopIds = transfers.SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo });

        var transferShopMap = await lookupLoader.LoadShopRequisitionSnapshotMapAsync(
            transferShopIds,
            cancellationToken,
            includeInactive: true);

        return transfers
            .Select(dto =>
            {
                var fromShop = MapTransferShop( dto.ShopIdFrom, transferShopMap, dto.Id, "From");
                var toShop = MapTransferShop(dto.ShopIdTo, transferShopMap, dto.Id, "To");
                return StdTransferMapper.ToUpdateModel(dto, fromShop, toShop);
            })
            .ToList();
    }

    private async Task<List<StdAdditionalCostUpdateModel>> BuildAdditionalCostModelsAsync(
        IReadOnlyCollection<SaveStdAdditionalCostDto> additionalCosts,
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
                var reason = MapAdditionalCostReason(dto.ReasonId, reasonMap, dto.Id);
                return StdAdditionalCostMapper.ToUpdateModel(dto, reason);
            })
            .ToList();
    }

    private static CostReason MapAdditionalCostReason(Guid reasonId, IReadOnlyDictionary<Guid, CostReason> reasonMap, Guid? rowId)
    {
        if (!reasonMap.TryGetValue(reasonId, out var reason))
        {
            throw new NotFoundException($"Additional cost reason '{reasonId}' was not found.");
        }

        if (!reason.AppliesToStd())
        {
            throw new BadRequestException($"Additional cost reason '{reason.Code} - {reason.Reason}' is not valid for STD requisitions.");
        }

        EnsureActiveForNewRow(isActive: reason.IsActive, rowId: rowId, lookupDescription: $"Additional cost reason '{reason.Code} - {reason.Reason}'");

        return reason;
    }

    private static StdCollectionType MapCollectionType(Guid collectionTypeId, IReadOnlyDictionary<Guid, StdCollectionType> collectionTypeMap, Guid? rowId)
    {
        if (!collectionTypeMap.TryGetValue(collectionTypeId, out var collectionType))
        {
            throw new NotFoundException($"STD collection type '{collectionTypeId}' was not found.");
        }

        EnsureActiveForNewRow(isActive: collectionType.IsActive, rowId: rowId, lookupDescription: $"STD collection type '{collectionType.Code} - {collectionType.Name}'");

        return collectionType;
    }

    private static StdLocation MapLocation(Guid locationId, IReadOnlyDictionary<Guid, StdLocation> locationMap, Guid? rowId)
    {
        if (!locationMap.TryGetValue(locationId, out var location))
        {
            throw new NotFoundException($"STD location '{locationId}' was not found.");
        }

        EnsureActiveForNewRow(isActive: location.IsActive, rowId: rowId, lookupDescription: $"STD location '{location.LocationName}'");

        return location;
    }

    private static ShopSnapshot MapTransferShop(Guid shopId, IReadOnlyDictionary<Guid, ShopRequisitionSnapshotDto> transferShops,
        Guid? rowId,
        string direction)
    {
        if (!transferShops.TryGetValue(shopId, out var shop))
        {
            throw new NotFoundException($"Shop '{shopId}' was not found.");
        }

        EnsureActiveForNewRow(isActive: shop.IsActive, rowId: rowId, lookupDescription: $"{direction} shop '{shop.Code} - {shop.Name}'");

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

    private static void EnsureActiveForNewRow(bool isActive, Guid? rowId, string lookupDescription)
    {
        if (!isActive && rowId is null)
        {
            throw new BadRequestException($"{lookupDescription} is inactive and cannot be added to a requisition.");
        }
    }
}