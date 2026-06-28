using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdTransferMapper
{
    public static StdTransferUpdateModel ToUpdateModel(
        SaveStdTransferDto dto,
        ShopSnapshot fromShop,
        ShopSnapshot toShop)
    {
        ArgumentNullException.ThrowIfNull(dto);
        ArgumentNullException.ThrowIfNull(fromShop);
        ArgumentNullException.ThrowIfNull(toShop);

        return new StdTransferUpdateModel(
            dto.Id,
            dto.Date,
            fromShop,
            toShop,
            dto.NumberOfBags,
            dto.NumberOfBoxes,
            dto.ChargeType,
            dto.Miles,
            dto.RatePerMile,
            dto.FlatCharge);
    }

    public static StdTransferDetailDto ToDetailDto(StdTransfer row, bool isShopFromActive, bool isShopToActive)
    {
        ArgumentNullException.ThrowIfNull(row);

        return new StdTransferDetailDto
        {
            Id = row.Id,
            Date = row.Date,

            ShopIdFrom = row.ShopIdFrom,
            ShopCodeFrom = row.ShopCodeFrom,
            ShopNameFrom = row.ShopNameFrom,
            IsShopFromActive = isShopFromActive,

            ShopIdTo = row.ShopIdTo,
            ShopCodeTo = row.ShopCodeTo,
            ShopNameTo = row.ShopNameTo,
            IsShopToActive = isShopToActive,

            NumberOfBags = row.NumberOfBags,
            NumberOfBoxes = row.NumberOfBoxes,

            ChargeType = row.ChargeType,
            Miles = row.Miles,
            RatePerMile = row.RatePerMile,
            FlatCharge = row.FlatCharge,

            TotalValue = row.TotalValue ?? 0m,
        };
    }
}