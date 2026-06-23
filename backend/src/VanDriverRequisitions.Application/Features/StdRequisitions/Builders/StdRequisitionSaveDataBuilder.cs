using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Mappings;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;
using VanDriverRequisitions.Application.Features.StdRequisitions.Models;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Builders;

public sealed class StdRequisitionSaveDataBuilder(IApplicationDbContext context) : IStdRequisitionSaveDataBuilder
{
    public async Task<StdRequisitionSaveData> BuildAsync(SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(saveStdRequisitionDto);

        var driverSummary = await LoadDriverSummaryAsync(saveStdRequisitionDto.VanDriverId, cancellationToken);
        var shop = await LoadShopSnapshotAsync(saveStdRequisitionDto.ShopId, cancellationToken);
        var details = StdRequisitionMapper.MapToRequisitionDetails(saveStdRequisitionDto, driverSummary, shop);

        var collectionChargeModels = await BuildCollectionChargeModelsAsync(
            saveStdRequisitionDto.CollectionChargesBanksAndBins,
            cancellationToken);

        var collectionVanPacks = await BuildCollectionVanPackModelsAsync(
            saveStdRequisitionDto.CollectionVanPacks,
            cancellationToken);

        var pickups = BuildPickupModels(saveStdRequisitionDto.Pickups);
        var transfers = await BuildTransferModelsAsync(saveStdRequisitionDto.Transfers, cancellationToken);
        var additionalCosts = await BuildAdditionalCostModelsAsync(saveStdRequisitionDto.AdditionalCosts, cancellationToken);

        var updateModel = new StdRequisitionUpdateModel(
            details,
            Pickups: pickups,
            Transfers: transfers,
            CollectionChargesBanksAndBins: collectionChargeModels,
            CollectionVanPacks: collectionVanPacks,
            AdditionalCosts: additionalCosts);

        return new StdRequisitionSaveData(driverSummary, updateModel, shop.IsActive);
    }

    private async Task<VanDriverLookupDto> LoadDriverSummaryAsync(Guid vanDriverId, CancellationToken cancellationToken)
    {
        return await context.VanDrivers
            .AsNoTracking()
            .Where(x => x.Id == vanDriverId)
            .Select(VanDriverProjections.AsLookupDto)
            .SingleAsync(cancellationToken);
    }

    private async Task<ShopRequisitionSnapshotDto> LoadShopSnapshotAsync(Guid shopId, CancellationToken cancellationToken)
    {
        return await context.Shops
            .AsNoTracking()
            .Where(x => x.Id == shopId)
            .Select(ShopProjections.AsRequisitionSnapshotDto)
            .SingleAsync(cancellationToken);
    }

    private async Task<Dictionary<Guid, StdCollectionType>> LoadCollectionTypeMapAsync(
        IEnumerable<SaveStdCollectionChargeBanksAndBinsDto> collectionCharges,
        CancellationToken cancellationToken)
    {
        var collectionTypeIds = collectionCharges
            .Select(x => x.CollectionTypeId)
            .Distinct()
            .ToList();

        return await context.StdCollectionTypes
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => collectionTypeIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private async Task<Dictionary<Guid, StdLocation>> LoadLocationMapAsync(
        IEnumerable<SaveStdCollectionChargeBanksAndBinsDto> collectionCharges,
        CancellationToken cancellationToken)
    {
        var locationIds = collectionCharges
            .Select(x => x.LocationId)
            .Distinct()
            .ToList();

        return await context.StdLocations
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(x => locationIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }
    
    private async Task<Dictionary<Guid, CostReason>> LoadReasonMapAsync(
        IEnumerable<SaveStdAdditionalCostDto> additionalCosts,
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
    
    private async Task<List<StdCollectionChargeBanksAndBinsUpdateModel>> BuildCollectionChargeModelsAsync(
        IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto> collectionCharges,
        CancellationToken cancellationToken)
    {
        if (collectionCharges.Count == 0)
        {
            return [];
        }
        
        var collectionTypeMap = await LoadCollectionTypeMapAsync(collectionCharges, cancellationToken);
        var locationMap = await LoadLocationMapAsync(collectionCharges, cancellationToken);

        return collectionCharges
            .Select(dto =>
            {
                var collectionType = MapCollectionType(dto.CollectionTypeId, collectionTypeMap);
                var location = MapLocation(dto.LocationId, locationMap);
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

        var transferShops = await LoadTransferShopSnapshotsAsync(transfers, cancellationToken);

        return transfers
            .Select(dto =>
            {
                var fromShop = MapTransferShop(dto.ShopIdFrom, transferShops, "From");
                var toShop = MapTransferShop(dto.ShopIdTo, transferShops, "To");
                return StdTransferMapper.ToUpdateModel(dto, fromShop, toShop);
            })
            .ToList();
    }

    private async Task<Dictionary<Guid, ShopSnapshot>> LoadTransferShopSnapshotsAsync(
        IReadOnlyCollection<SaveStdTransferDto> transfers,
        CancellationToken cancellationToken)
    {
        var transferShopIds = transfers
            .SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo })
            .Distinct()
            .ToList();

        return await context.Shops
            .Where(x => transferShopIds.Contains(x.Id))
            .Select(x => new ShopSnapshot(x.Id, x.Code, x.Name))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
    }

    private static ShopSnapshot MapTransferShop(Guid shopId, IReadOnlyDictionary<Guid, ShopSnapshot> transferShops, string direction)
    {
        return transferShops.TryGetValue(shopId, out var shop)
            ? shop
            : throw new BadRequestException($"{direction} shop '{shopId}' was not found.");
    }
    
    private async Task<List<StdAdditionalCostUpdateModel>> BuildAdditionalCostModelsAsync(
        IReadOnlyCollection<SaveStdAdditionalCostDto> additionalCosts,
        CancellationToken cancellationToken)
    {
        if (additionalCosts.Count == 0)
        {
            return [];
        }

        var reasonMap = await LoadReasonMapAsync(additionalCosts, cancellationToken);

        return additionalCosts
            .Select(dto =>
            {
                var reason = MapAdditionalCostReason(dto.ReasonId, reasonMap);
                return StdAdditionalCostMapper.ToUpdateModel(dto, reason);
            })
            .ToList();
    }

    private static CostReason MapAdditionalCostReason(Guid reasonId, IReadOnlyDictionary<Guid, CostReason> reasonMap)
    {
        if (!reasonMap.TryGetValue(reasonId, out var reason))
        {
            throw new NotFoundException($"Additional cost reason '{reasonId}' was not found.");
        }

        return reason.Scope is not CostReasonScope.Std and not CostReasonScope.Shared 
            ? throw new BadRequestException($"Additional cost reason '{reason.Code} - {reason.Reason}' is not valid for STD requisitions.") 
            : reason;
    }
    
    private static StdCollectionType MapCollectionType(Guid collectionTypeId, IReadOnlyDictionary<Guid, StdCollectionType> collectionTypeMap)
    {
        return !collectionTypeMap.TryGetValue(collectionTypeId, out var collectionType)
            ? throw new NotFoundException($"STD collection type '{collectionTypeId}' was not found.")
            : collectionType;
    }

    private static StdLocation MapLocation(Guid locationId, IReadOnlyDictionary<Guid, StdLocation> locationMap)
    {
        return !locationMap.TryGetValue(locationId, out var location)
            ? throw new NotFoundException($"STD location '{locationId}' was not found.")
            : location;
    }
    
    private async Task<decimal> GetRequiredVanPackRateAsync(CancellationToken cancellationToken)
    {
        var rule = await context.RequisitionLimitRules
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.Fascia == Fascia.Std &&
                     x.Category == RequisitionRowCategory.VanPack,
                cancellationToken);

        if (rule is null)
        {
            throw new ValidationException(
            [
                new ValidationFailure(
                    nameof(SaveStdRequisitionDto.CollectionVanPacks),
                    "No STD van pack pricing rule is configured. Please contact an administrator.")
            ]);
        }

        return rule.MaxRate;
    }
}