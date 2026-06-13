using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class WeeklyQuantitiesMapper
{
    public static WeeklyQuantitiesDto ToDto(WeeklyQuantities week)
    {
        return new WeeklyQuantitiesDto
        {
            Sunday = week.Sunday,
            Monday = week.Monday,
            Tuesday = week.Tuesday,
            Wednesday = week.Wednesday,
            Thursday = week.Thursday,
            Friday = week.Friday,
            Saturday = week.Saturday
        };
    }
    
    public static WeeklyQuantities ToValueObject(WeeklyQuantitiesDto week)
    {
        return new WeeklyQuantities(
            week.Sunday,
            week.Monday,
            week.Tuesday,
            week.Wednesday,
            week.Thursday,
            week.Friday,
            week.Saturday);
    }
}