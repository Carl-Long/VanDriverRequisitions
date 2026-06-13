using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeMileageTests
{
    private static readonly DateOnly WeekEndingDate = new(2026, 6, 13);

    [Fact]
    public void Create_WhenValid_CalculatesTotalMilesAndTotalValue()
    {
        // Arrange
        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var mileage = FeMileage.Create(
            WeekEndingDate,
            week,
            ratePerMile: 0.50m);

        // Assert
        Assert.Equal(WeekEndingDate, mileage.WeekEndingDate);
        Assert.Same(week, mileage.Week);
        Assert.Equal(28, mileage.TotalMiles);
        Assert.Equal(0.50m, mileage.RatePerMile);
        Assert.Equal(14.00m, mileage.TotalValue);
    }

    [Fact]
    public void Create_WhenRateIsNull_CalculatesTotalMilesAndZeroTotalValue()
    {
        // Arrange
        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var mileage = FeMileage.Create(
            WeekEndingDate,
            week,
            ratePerMile: null);

        // Assert
        Assert.Equal(28, mileage.TotalMiles);
        Assert.Null(mileage.RatePerMile);
        Assert.Equal(0m, mileage.TotalValue);
    }

    [Fact]
    public void Create_WhenWeekHasNullValues_TreatsNullValuesAsZero()
    {
        // Arrange
        var week = CreateWeek(
            sunday: null,
            monday: 2,
            tuesday: null,
            wednesday: 4,
            thursday: null,
            friday: 6,
            saturday: null);

        // Act
        var mileage = FeMileage.Create(
            WeekEndingDate,
            week,
            ratePerMile: 0.50m);

        // Assert
        Assert.Equal(12, mileage.TotalMiles);
        Assert.Equal(6.00m, mileage.TotalValue);
    }

    [Fact]
    public void Update_WhenValid_UpdatesWeekEndingDateWeekRateAndRecalculatesTotals()
    {
        // Arrange
        var mileage = CreateMileage();
        var newWeekEndingDate = new DateOnly(2026, 6, 20);
        var newWeek = CreateWeek(10, 20, 30, 40, 50, 60, 70);

        // Act
        mileage.Update(
            newWeekEndingDate,
            newWeek,
            ratePerMile: 0.25m);

        // Assert
        Assert.Equal(newWeekEndingDate, mileage.WeekEndingDate);
        Assert.Same(newWeek, mileage.Week);
        Assert.Equal(280, mileage.TotalMiles);
        Assert.Equal(0.25m, mileage.RatePerMile);
        Assert.Equal(70.00m, mileage.TotalValue);
    }

    [Fact]
    public void Create_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeMileage.Create(
                WeekEndingDate,
                null!,
                ratePerMile: 0.50m));

        // Assert
        Assert.Equal("week", exception.ParamName);
    }

    [Fact]
    public void Update_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var mileage = CreateMileage();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            mileage.Update(
                new DateOnly(2026, 6, 20),
                null!,
                ratePerMile: 0.50m));

        // Assert
        Assert.Equal("week", exception.ParamName);
    }

    [Fact]
    public void Create_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeMileage.Create(
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerMile: -0.01m));
    }

    [Fact]
    public void Update_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var mileage = CreateMileage();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            mileage.Update(
                new DateOnly(2026, 6, 20),
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerMile: -0.01m));
    }

    private static FeMileage CreateMileage()
    {
        return FeMileage.Create(
            WeekEndingDate,
            CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerMile: 0.50m);
    }

    private static WeeklyQuantities CreateWeek(
        int? sunday = 0,
        int? monday = 0,
        int? tuesday = 0,
        int? wednesday = 0,
        int? thursday = 0,
        int? friday = 0,
        int? saturday = 0)
    {
        return new WeeklyQuantities(
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday);
    }
}