using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdCollectionChargeBanksAndBinsMapper
{
    public static StdCollectionChargeBanksAndBinsUpdateModel ToUpdateModel(
        SaveStdCollectionChargeBanksAndBinsDto saveStdCollectionChargeBanksAndBinsDto,
        StdCollectionType collectionType,
        StdLocation location)
    {
        return new StdCollectionChargeBanksAndBinsUpdateModel(
            saveStdCollectionChargeBanksAndBinsDto.Id,
            saveStdCollectionChargeBanksAndBinsDto.Date,
            collectionType.Id,
            collectionType.Name,
            collectionType.Code,
            location.Id,
            location.ShopId,
            location.CollectionTypeId,
            location.LocationName,
            location.PostCode,
            saveStdCollectionChargeBanksAndBinsDto.NumberOfBags,
            saveStdCollectionChargeBanksAndBinsDto.ChargeType,
            saveStdCollectionChargeBanksAndBinsDto.Miles,
            saveStdCollectionChargeBanksAndBinsDto.RatePerMile,
            saveStdCollectionChargeBanksAndBinsDto.FlatCharge);
    }

    public static StdCollectionChargeBanksAndBinsDetailDto ToDetailDto(
            StdCollectionChargeBanksAndBins collectionCharge,
            bool isCollectionTypeActive,
            bool isLocationActive,
            bool isLocationLinkedToRequisitionShop,
            bool isLocationLinkedToCollectionType)
    {
        return new StdCollectionChargeBanksAndBinsDetailDto
        {
            Id = collectionCharge.Id,
            Date = collectionCharge.Date,

            CollectionTypeId = collectionCharge.CollectionTypeId,
            CollectionTypeName = collectionCharge.CollectionTypeNameSnapshot,
            CollectionTypeCode = collectionCharge.CollectionTypeCodeSnapshot,
            IsCollectionTypeActive = isCollectionTypeActive,

            LocationId = collectionCharge.LocationId,
            LocationName = collectionCharge.LocationNameSnapshot,
            LocationPostCode = collectionCharge.LocationPostCodeSnapshot,
            IsLocationActive = isLocationActive,
            IsLocationLinkedToRequisitionShop = isLocationLinkedToRequisitionShop,
            IsLocationLinkedToCollectionType = isLocationLinkedToCollectionType,

            NumberOfBags = collectionCharge.NumberOfBags,

            ChargeType = collectionCharge.ChargeType,
            Miles = collectionCharge.Miles,
            RatePerMile = collectionCharge.RatePerMile,
            FlatCharge = collectionCharge.FlatCharge,
            TotalValue = collectionCharge.TotalValue
        };
    }
}