using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

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
        var mileage = FeMileage.Create(CreateModel(
            week: week,
            ratePerMile: 0.50m));

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
        var mileage = FeMileage.Create(CreateModel(
            week: week,
            ratePerMile: null));

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
        var mileage = FeMileage.Create(CreateModel(
            week: week,
            ratePerMile: 0.50m));

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
        mileage.Update(CreateModel(
            weekEndingDate: newWeekEndingDate,
            week: newWeek,
            ratePerMile: 0.25m));

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
        // Arrange
        var model = new FeMileageUpdateModel(
            Id: null,
            WeekEndingDate,
            Week: null!,
            RatePerMile: 0.50m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => FeMileage.Create(model));
    }

    [Fact]
    public void Update_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var mileage = CreateMileage();

        var model = new FeMileageUpdateModel(
            Id: null,
            new DateOnly(2026, 6, 20),
            Week: null!,
            RatePerMile: 0.50m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => mileage.Update(model));
    }

    [Fact]
    public void Create_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeMileage.Create(CreateModel(ratePerMile: -0.01m)));
    }

    [Fact]
    public void Update_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var mileage = CreateMileage();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            mileage.Update(CreateModel(
                weekEndingDate: new DateOnly(2026, 6, 20),
                ratePerMile: -0.01m)));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(0.001)]
    public void Create_WhenRateIsBelowMinimum_ThrowsInvalidOperationException(decimal ratePerMile)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeMileage.Create(CreateModel(ratePerMile: ratePerMile)));
    }
    
    [Fact]
    public void Create_WhenWeekEndingDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = new FeMileageUpdateModel(
            Id: null,
            WeekEndingDate: default(DateOnly),
            Week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
            RatePerMile: 0.50m);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => FeMileage.Create(model));
    }

    private static FeMileage CreateMileage()
    {
        return FeMileage.Create(CreateModel(
            week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerMile: 0.50m));
    }

    private static FeMileageUpdateModel CreateModel(
        Guid? id = null,
        DateOnly? weekEndingDate = null,
        WeeklyQuantities? week = null,
        decimal? ratePerMile = 0.50m)
    {
        return new FeMileageUpdateModel(
            id,
            weekEndingDate ?? WeekEndingDate,
            week ?? CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerMile);
    }
}