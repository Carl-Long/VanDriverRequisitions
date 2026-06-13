using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.UnitTests.TestData;

public static class WeeklyQuantitiesTestData
{
    public static WeeklyQuantities CreateWeek(
        int? sunday = 0,
        int? monday = 0,
        int? tuesday = 0,
        int? wednesday = 0,
        int? thursday = 0,
        int? friday = 0,
        int? saturday = 0)
    {
        return new WeeklyQuantities(sunday, monday, tuesday, wednesday, thursday, friday, saturday);
    }
}