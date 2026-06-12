using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeMileageMapper
{
    public static FeMileageUpdateModel ToUpdateModel(SaveFeMileageDto saveFeMileageDto)
    {
        return new FeMileageUpdateModel(
            saveFeMileageDto.Id,
            saveFeMileageDto.WeekEndingDate,
            WeeklyQuantitiesMapper.ToValueObject(saveFeMileageDto.Week),
            saveFeMileageDto.RatePerMile);
    }

    public static FeMileageDetailDto ToDetailDto(FeMileage mileage)
    {
        return new FeMileageDetailDto
        {
            Id = mileage.Id,
            WeekEndingDate = mileage.WeekEndingDate,
            Week = WeeklyQuantitiesMapper.ToDto(mileage.Week),
            TotalMiles = mileage.TotalMiles,
            RatePerMile = mileage.RatePerMile,
            TotalValue = mileage.TotalValue
        };
    }
}