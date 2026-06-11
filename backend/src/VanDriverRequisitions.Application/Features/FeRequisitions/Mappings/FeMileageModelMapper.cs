using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeMileageModelMapper
{
    public static FeMileageUpdateModel ToUpdateModel(SaveFeMileageDto saveFeMileageDto)
    {
        return new FeMileageUpdateModel(saveFeMileageDto.Id, saveFeMileageDto.WeekEndingDate, new WeeklyQuantities(
                saveFeMileageDto.Week.Sunday,
                saveFeMileageDto.Week.Monday,
                saveFeMileageDto.Week.Tuesday,
                saveFeMileageDto.Week.Wednesday,
                saveFeMileageDto.Week.Thursday,
                saveFeMileageDto.Week.Friday,
                saveFeMileageDto.Week.Saturday),
            saveFeMileageDto.RatePerMile);
    }
}