using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.UnitTests.ValueObjects;

public sealed class WeeklyQuantitiesTests
{
    [Fact]
    public void Create_WhenValuesAreValid_CalculatesTotal()
    {
        var week = new WeeklyQuantities(
            sunday: 1,
            monday: 2,
            tuesday: 3,
            wednesday: 4,
            thursday: 5,
            friday: 6,
            saturday: 7);

        Assert.Equal(28, week.Total);
    }

    [Fact]
    public void Create_WhenValuesAreNull_TreatsNullValuesAsZero()
    {
        var week = new WeeklyQuantities(
            sunday: null,
            monday: 2,
            tuesday: null,
            wednesday: 4,
            thursday: null,
            friday: 6,
            saturday: null);

        Assert.Equal(12, week.Total);
    }

    [Theory]
    [InlineData("Sunday")]
    [InlineData("Monday")]
    [InlineData("Tuesday")]
    [InlineData("Wednesday")]
    [InlineData("Thursday")]
    [InlineData("Friday")]
    [InlineData("Saturday")]
    public void Create_WhenAnyDayIsNegative_ThrowsArgumentOutOfRangeException(string day)
    {
        var exception = Assert.Throws<ArgumentOutOfRangeException>(() =>
            day switch
            {
                "Sunday" => new WeeklyQuantities(-1, 0, 0, 0, 0, 0, 0),
                "Monday" => new WeeklyQuantities(0, -1, 0, 0, 0, 0, 0),
                "Tuesday" => new WeeklyQuantities(0, 0, -1, 0, 0, 0, 0),
                "Wednesday" => new WeeklyQuantities(0, 0, 0, -1, 0, 0, 0),
                "Thursday" => new WeeklyQuantities(0, 0, 0, 0, -1, 0, 0),
                "Friday" => new WeeklyQuantities(0, 0, 0, 0, 0, -1, 0),
                "Saturday" => new WeeklyQuantities(0, 0, 0, 0, 0, 0, -1),
                _ => throw new ArgumentOutOfRangeException(nameof(day), day, "Unknown day.")
            });

        Assert.Equal(day.ToLowerInvariant(), exception.ParamName);
    }
}