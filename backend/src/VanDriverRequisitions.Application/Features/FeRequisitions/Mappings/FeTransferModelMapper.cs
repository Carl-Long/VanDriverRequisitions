using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeTransferModelMapper
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
            new WeeklyQuantities(
                saveFeTransferDto.Week.Sunday,
                saveFeTransferDto.Week.Monday,
                saveFeTransferDto.Week.Tuesday,
                saveFeTransferDto.Week.Wednesday,
                saveFeTransferDto.Week.Thursday,
                saveFeTransferDto.Week.Friday,
                saveFeTransferDto.Week.Saturday),
            saveFeTransferDto.RatePerJob);
    }
}