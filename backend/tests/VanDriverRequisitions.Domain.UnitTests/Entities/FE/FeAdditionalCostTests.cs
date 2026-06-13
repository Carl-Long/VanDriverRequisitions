using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeAdditionalCostTests
{
    private static readonly DateOnly WeekEndingDate = new(2026, 6, 13);
    public static TheoryData<decimal?> MissingOrNegativeRates => [null, -0.01m];

    [Fact]
    public void Create_WhenJobBased_CalculatesTotalValueAndClearsMileageFields()
    {
        // Arrange
        var reasonId = Guid.NewGuid();

        // Act
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            reasonId,
            "Parking",
            ChargingOption.Job,
            totalNumber: 3,
            ratePerJob: 10m,
            miles: 999,
            ratePerMile: 999m);

        // Assert
        Assert.Equal(WeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(reasonId, cost.ReasonId);
        Assert.Equal("Parking", cost.ReasonText);
        Assert.Equal(ChargingOption.Job, cost.ChargingOption);

        Assert.Equal(3, cost.TotalNumber);
        Assert.Equal(10m, cost.RatePerJob);
        Assert.Equal(30m, cost.TotalValue);

        Assert.Null(cost.Miles);
        Assert.Null(cost.RatePerMile);
    }

    [Fact]
    public void Create_WhenMileageBased_CalculatesTotalValueAndClearsJobFields()
    {
        // Arrange
        var reasonId = Guid.NewGuid();

        // Act
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            reasonId,
            "Extra mileage",
            ChargingOption.Mileage,
            totalNumber: 999,
            ratePerJob: 999m,
            miles: 20,
            ratePerMile: 0.45m);

        // Assert
        Assert.Equal(WeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(reasonId, cost.ReasonId);
        Assert.Equal("Extra mileage", cost.ReasonText);
        Assert.Equal(ChargingOption.Mileage, cost.ChargingOption);

        Assert.Equal(20, cost.Miles);
        Assert.Equal(0.45m, cost.RatePerMile);
        Assert.Equal(9.00m, cost.TotalValue);

        Assert.Null(cost.TotalNumber);
        Assert.Null(cost.RatePerJob);
    }

    [Fact]
    public void Update_WhenChangingFromJobToMileage_ClearsJobFieldsAndRecalculatesTotalValue()
    {
        // Arrange
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            Guid.NewGuid(),
            "Parking",
            ChargingOption.Job,
            totalNumber: 3,
            ratePerJob: 10m,
            miles: null,
            ratePerMile: null);

        var newWeekEndingDate = new DateOnly(2026, 6, 20);
        var newReasonId = Guid.NewGuid();

        // Act
        cost.Update(
            newWeekEndingDate,
            newReasonId,
            "Extra mileage",
            ChargingOption.Mileage,
            totalNumber: 999,
            ratePerJob: 999m,
            miles: 50,
            ratePerMile: 0.50m);

        // Assert
        Assert.Equal(newWeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(newReasonId, cost.ReasonId);
        Assert.Equal("Extra mileage", cost.ReasonText);
        Assert.Equal(ChargingOption.Mileage, cost.ChargingOption);

        Assert.Equal(50, cost.Miles);
        Assert.Equal(0.50m, cost.RatePerMile);
        Assert.Equal(25.00m, cost.TotalValue);

        Assert.Null(cost.TotalNumber);
        Assert.Null(cost.RatePerJob);
    }

    [Fact]
    public void Update_WhenChangingFromMileageToJob_ClearsMileageFieldsAndRecalculatesTotalValue()
    {
        // Arrange
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            Guid.NewGuid(),
            "Extra mileage",
            ChargingOption.Mileage,
            totalNumber: null,
            ratePerJob: null,
            miles: 20,
            ratePerMile: 0.45m);

        var newWeekEndingDate = new DateOnly(2026, 6, 20);
        var newReasonId = Guid.NewGuid();

        // Act
        cost.Update(
            newWeekEndingDate,
            newReasonId,
            "Parking",
            ChargingOption.Job,
            totalNumber: 4,
            ratePerJob: 12.50m,
            miles: 999,
            ratePerMile: 999m);

        // Assert
        Assert.Equal(newWeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(newReasonId, cost.ReasonId);
        Assert.Equal("Parking", cost.ReasonText);
        Assert.Equal(ChargingOption.Job, cost.ChargingOption);

        Assert.Equal(4, cost.TotalNumber);
        Assert.Equal(12.50m, cost.RatePerJob);
        Assert.Equal(50.00m, cost.TotalValue);

        Assert.Null(cost.Miles);
        Assert.Null(cost.RatePerMile);
    }

    [Fact]
    public void Update_WhenSameChargingOptionIsUsed_UpdatesReasonWeekAndRecalculatesTotalValue()
    {
        // Arrange
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            Guid.NewGuid(),
            "Parking",
            ChargingOption.Job,
            totalNumber: 2,
            ratePerJob: 5m,
            miles: null,
            ratePerMile: null);

        var newWeekEndingDate = new DateOnly(2026, 6, 20);
        var newReasonId = Guid.NewGuid();

        // Act
        cost.Update(
            newWeekEndingDate,
            newReasonId,
            "Toll charge",
            ChargingOption.Job,
            totalNumber: 6,
            ratePerJob: 7.50m,
            miles: null,
            ratePerMile: null);

        // Assert
        Assert.Equal(newWeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(newReasonId, cost.ReasonId);
        Assert.Equal("Toll charge", cost.ReasonText);
        Assert.Equal(ChargingOption.Job, cost.ChargingOption);
        Assert.Equal(6, cost.TotalNumber);
        Assert.Equal(7.50m, cost.RatePerJob);
        Assert.Equal(45.00m, cost.TotalValue);
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WhenJobTotalNumberIsMissingOrNotPositive_ThrowsInvalidOperationException(int? totalNumber)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                "Parking",
                ChargingOption.Job,
                totalNumber,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));
    }

    [Theory]
    [MemberData(nameof(MissingOrNegativeRates))]
    public void Create_WhenJobRateIsMissingOrNegative_ThrowsInvalidOperationException(decimal? ratePerJob)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                "Parking",
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob,
                miles: null,
                ratePerMile: null));
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WhenMilesIsMissingOrNotPositive_ThrowsInvalidOperationException(int? miles)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                "Extra mileage",
                ChargingOption.Mileage,
                totalNumber: null,
                ratePerJob: null,
                miles,
                ratePerMile: 0.45m));
    }

    [Theory]
    [MemberData(nameof(MissingOrNegativeRates))]
    public void Create_WhenRatePerMileIsMissingOrNegative_ThrowsInvalidOperationException(decimal? ratePerMile)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                "Extra mileage",
                ChargingOption.Mileage,
                totalNumber: null,
                ratePerJob: null,
                miles: 10,
                ratePerMile));
    }

    [Fact]
    public void Create_WhenReasonTextHasWhitespace_TrimsReasonText()
    {
        // Act
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            Guid.NewGuid(),
            "  Parking  ",
            ChargingOption.Job,
            totalNumber: 1,
            ratePerJob: 10m,
            miles: null,
            ratePerMile: null);

        // Assert
        Assert.Equal("Parking", cost.ReasonText);
    }

    [Fact]
    public void Create_WhenReasonTextIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                null!,
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        // Assert
        Assert.Equal("reasonText", exception.ParamName);
    }
    
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonTextIsEmptyOrWhitespace_ThrowsArgumentException(string reasonText)
    {
        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                reasonText,
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        // Assert
        Assert.Equal("reasonText", exception.ParamName);
    }

    [Fact]
    public void Create_WhenChargingOptionIsUnknown_ThrowsArgumentOutOfRangeException()
    {
        // Act
        var exception = Assert.Throws<ArgumentOutOfRangeException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                Guid.NewGuid(),
                "Parking",
                (ChargingOption)999,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        // Assert
        Assert.Equal("chargingOption", exception.ParamName);
    }
}