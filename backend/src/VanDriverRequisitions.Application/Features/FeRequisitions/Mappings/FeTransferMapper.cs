using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeTransferMapper
{
    public static FeTransferUpdateModel ToUpdateModel(
        SaveFeTransferDto saveFeTransferDto,
        ShopSnapshot fromShop,
        ShopSnapshot toShop)
    {
        return new FeTransferUpdateModel(
            saveFeTransferDto.Id,
            fromShop,
            toShop,
            saveFeTransferDto.WeekEndingDate,
            WeeklyQuantitiesMapper.ToValueObject(saveFeTransferDto.Week),
            saveFeTransferDto.RatePerJob);
    }
    
    public static FeTransferDetailDto ToDetailDto(FeTransfer transfer)
    {
        return new FeTransferDetailDto
        {
            Id = transfer.Id,
            WeekEndingDate = transfer.WeekEndingDate,

            ShopIdFrom = transfer.ShopIdFrom,
            ShopCodeFrom = transfer.ShopCodeFrom,
            ShopNameFrom = transfer.ShopNameFrom,

            ShopIdTo = transfer.ShopIdTo,
            ShopCodeTo = transfer.ShopCodeTo,
            ShopNameTo = transfer.ShopNameTo,

            Week = WeeklyQuantitiesMapper.ToDto(transfer.Week),
            TotalNumber = transfer.TotalNumber,
            RatePerJob = transfer.RatePerJob,
            TotalValue = transfer.TotalValue
        };
    }
}