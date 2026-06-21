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
using VanDriverRequisitions.Domain.Entities.Common.Models;
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

        var collectionTypeMap = await LoadCollectionTypeMapAsync(
            saveStdRequisitionDto.CollectionChargesBanksAndBins,
            cancellationToken);

        var locationMap = await LoadLocationMapAsync(
            saveStdRequisitionDto.CollectionChargesBanksAndBins,
            cancellationToken);

        var details = StdRequisitionMapper.MapToRequisitionDetails(
            saveStdRequisitionDto,
            driverSummary,
            shop);

        var collectionChargeModels = BuildCollectionChargeModels(
            saveStdRequisitionDto.CollectionChargesBanksAndBins,
            collectionTypeMap,
            locationMap);
        
        var vanPackRate = saveStdRequisitionDto.CollectionVanPacks.Count > 0
            ? await GetRequiredVanPackRateAsync(cancellationToken)
            : 0m;
        
        var collectionVanPacks = saveStdRequisitionDto.CollectionVanPacks
            .Select(x => StdCollectionVanPackMapper.ToUpdateModel(x, vanPackRate))
            .ToList();
        
        var pickups = saveStdRequisitionDto.Pickups
            .Select(StdPickupMapper.ToUpdateModel)
            .ToList();
        
        var transferShopIds = saveStdRequisitionDto.Transfers
            .SelectMany(x => new[] { x.ShopIdFrom, x.ShopIdTo })
            .Distinct()
            .ToList();
        
        var transferShops = await context.Shops
            .Where(x => transferShopIds.Contains(x.Id))
            .Select(x => new ShopSnapshot(x.Id, x.Code, x.Name))
            .ToDictionaryAsync(x => x.Id, cancellationToken);
        
        var transfers = saveStdRequisitionDto.Transfers
            .Select(x =>
            {
                if (!transferShops.TryGetValue(x.ShopIdFrom, out var fromShop))
                {
                    throw new BadRequestException($"From shop '{x.ShopIdFrom}' was not found.");
                }

                return !transferShops.TryGetValue(x.ShopIdTo, out var toShop) 
                    ? throw new BadRequestException($"To shop '{x.ShopIdTo}' was not found.") 
                    : StdTransferMapper.ToUpdateModel(x, fromShop, toShop);
            })
            .ToList();

        var updateModel = new StdRequisitionUpdateModel(
            details,
            Pickups: pickups,
            Transfers: transfers,
            CollectionChargesBanksAndBins: collectionChargeModels,
            CollectionVanPacks: collectionVanPacks,
            AdditionalCosts: []);

        return new StdRequisitionSaveData(driverSummary, updateModel, shop.IsActive);
    }

    private async Task<VanDriverLookupDto> LoadDriverSummaryAsync(
        Guid vanDriverId,
        CancellationToken cancellationToken)
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

    private static List<StdCollectionChargeBanksAndBinsUpdateModel> BuildCollectionChargeModels(
        IEnumerable<SaveStdCollectionChargeBanksAndBinsDto> collectionCharges,
        IReadOnlyDictionary<Guid, StdCollectionType> collectionTypeMap,
        IReadOnlyDictionary<Guid, StdLocation> locationMap)
    {
        return collectionCharges
            .Select(dto =>
            {
                var collectionType = MapCollectionType(dto.CollectionTypeId, collectionTypeMap);
                var location = MapLocation(dto.LocationId, locationMap);

                return StdCollectionChargeBanksAndBinsMapper.ToUpdateModel(dto, collectionType, location);
            })
            .ToList();
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