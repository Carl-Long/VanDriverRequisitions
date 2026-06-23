using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeAdditionalCostTests
{
    private static readonly DateOnly WeekEndingDate = new(2026, 6, 13);

    private static readonly Guid ParkingReasonId = Guid.NewGuid();
    private const string ParkingReasonCode = "10001";
    private const string ParkingReasonText = "Parking";

    private static readonly Guid ExtraMileageReasonId = Guid.NewGuid();
    private const string ExtraMileageReasonCode = "10004";
    private const string ExtraMileageReasonText = "Extra mileage";

    private static readonly Guid TollReasonId = Guid.NewGuid();
    private const string TollReasonCode = "10002";
    private const string TollReasonText = "Toll charge";

    public static TheoryData<decimal?> MissingOrNegativeRates => [null, -0.01m];

    [Fact]
    public void Create_WhenJobBased_SnapshotsReasonAndCalculatesTotalValue()
    {
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            ParkingReasonId,
            ParkingReasonCode,
            ParkingReasonText,
            ChargingOption.Job,
            totalNumber: 3,
            ratePerJob: 10m,
            miles: 999,
            ratePerMile: 999m);

        Assert.Equal(WeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(ParkingReasonId, cost.ReasonId);
        Assert.Equal(ParkingReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(ParkingReasonText, cost.ReasonTextSnapshot);
        Assert.Equal(ChargingOption.Job, cost.ChargingOption);

        Assert.Equal(3, cost.TotalNumber);
        Assert.Equal(10m, cost.RatePerJob);
        Assert.Equal(30m, cost.TotalValue);

        Assert.Null(cost.Miles);
        Assert.Null(cost.RatePerMile);
    }

    [Fact]
    public void Create_WhenMileageBased_SnapshotsReasonCalculatesTotalValueAndClearsJobFields()
    {
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            ExtraMileageReasonId,
            ExtraMileageReasonCode,
            ExtraMileageReasonText,
            ChargingOption.Mileage,
            totalNumber: 999,
            ratePerJob: 999m,
            miles: 20,
            ratePerMile: 0.45m);

        Assert.Equal(WeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(ExtraMileageReasonId, cost.ReasonId);
        Assert.Equal(ExtraMileageReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(ExtraMileageReasonText, cost.ReasonTextSnapshot);
        Assert.Equal(ChargingOption.Mileage, cost.ChargingOption);

        Assert.Equal(20, cost.Miles);
        Assert.Equal(0.45m, cost.RatePerMile);
        Assert.Equal(9.00m, cost.TotalValue);

        Assert.Null(cost.TotalNumber);
        Assert.Null(cost.RatePerJob);
    }

    [Fact]
    public void Update_WhenChangingFromJobToMileage_UpdatesReasonSnapshotsClearsJobFieldsAndRecalculatesTotalValue()
    {
        var cost = CreateJobCost();

        var newWeekEndingDate = new DateOnly(2026, 6, 20);

        cost.Update(
            newWeekEndingDate,
            ExtraMileageReasonId,
            ExtraMileageReasonCode,
            ExtraMileageReasonText,
            ChargingOption.Mileage,
            totalNumber: 999,
            ratePerJob: 999m,
            miles: 50,
            ratePerMile: 0.50m);

        Assert.Equal(newWeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(ExtraMileageReasonId, cost.ReasonId);
        Assert.Equal(ExtraMileageReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(ExtraMileageReasonText, cost.ReasonTextSnapshot);
        Assert.Equal(ChargingOption.Mileage, cost.ChargingOption);

        Assert.Equal(50, cost.Miles);
        Assert.Equal(0.50m, cost.RatePerMile);
        Assert.Equal(25.00m, cost.TotalValue);

        Assert.Null(cost.TotalNumber);
        Assert.Null(cost.RatePerJob);
    }

    [Fact]
    public void Update_WhenChangingFromMileageToJob_UpdatesReasonSnapshotsClearsMileageFieldsAndRecalculatesTotalValue()
    {
        var cost = CreateMileageCost();

        var newWeekEndingDate = new DateOnly(2026, 6, 20);

        cost.Update(
            newWeekEndingDate,
            ParkingReasonId,
            ParkingReasonCode,
            ParkingReasonText,
            ChargingOption.Job,
            totalNumber: 4,
            ratePerJob: 12.50m,
            miles: 999,
            ratePerMile: 999m);

        Assert.Equal(newWeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(ParkingReasonId, cost.ReasonId);
        Assert.Equal(ParkingReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(ParkingReasonText, cost.ReasonTextSnapshot);
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
        var cost = CreateJobCost(totalNumber: 2, ratePerJob: 5m);

        var newWeekEndingDate = new DateOnly(2026, 6, 20);

        cost.Update(
            newWeekEndingDate,
            TollReasonId,
            TollReasonCode,
            TollReasonText,
            ChargingOption.Job,
            totalNumber: 6,
            ratePerJob: 7.50m,
            miles: null,
            ratePerMile: null);

        Assert.Equal(newWeekEndingDate, cost.WeekEndingDate);
        Assert.Equal(TollReasonId, cost.ReasonId);
        Assert.Equal(TollReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(TollReasonText, cost.ReasonTextSnapshot);
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
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                ParkingReasonCode,
                ParkingReasonText,
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
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                ParkingReasonCode,
                ParkingReasonText,
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
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ExtraMileageReasonId,
                ExtraMileageReasonCode,
                ExtraMileageReasonText,
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
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ExtraMileageReasonId,
                ExtraMileageReasonCode,
                ExtraMileageReasonText,
                ChargingOption.Mileage,
                totalNumber: null,
                ratePerJob: null,
                miles: 10,
                ratePerMile));
    }

    [Fact]
    public void Create_WhenReasonSnapshotsHaveWhitespace_TrimsReasonSnapshots()
    {
        var cost = FeAdditionalCost.Create(
            WeekEndingDate,
            ParkingReasonId,
            "  10001  ",
            "  Parking  ",
            ChargingOption.Job,
            totalNumber: 1,
            ratePerJob: 10m,
            miles: null,
            ratePerMile: null);

        Assert.Equal(ParkingReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(ParkingReasonText, cost.ReasonTextSnapshot);
    }

    [Fact]
    public void Create_WhenReasonCodeSnapshotIsNull_ThrowsArgumentNullException()
    {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                null!,
                ParkingReasonText,
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        Assert.Equal("reasonCodeSnapshot", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonCodeSnapshotIsEmptyOrWhitespace_ThrowsArgumentException(string reasonCodeSnapshot)
    {
        var exception = Assert.Throws<ArgumentException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                reasonCodeSnapshot,
                ParkingReasonText,
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        Assert.Equal("reasonCodeSnapshot", exception.ParamName);
    }

    [Fact]
    public void Create_WhenReasonTextSnapshotIsNull_ThrowsArgumentNullException()
    {
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                ParkingReasonCode,
                null!,
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        Assert.Equal("reasonTextSnapshot", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonTextSnapshotIsEmptyOrWhitespace_ThrowsArgumentException(string reasonTextSnapshot)
    {
        var exception = Assert.Throws<ArgumentException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                ParkingReasonCode,
                reasonTextSnapshot,
                ChargingOption.Job,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        Assert.Equal("reasonTextSnapshot", exception.ParamName);
    }

    [Fact]
    public void Create_WhenChargingOptionIsUnknown_ThrowsArgumentOutOfRangeException()
    {
        var exception = Assert.Throws<ArgumentOutOfRangeException>(() =>
            FeAdditionalCost.Create(
                WeekEndingDate,
                ParkingReasonId,
                ParkingReasonCode,
                ParkingReasonText,
                (ChargingOption)999,
                totalNumber: 1,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null));

        Assert.Equal("chargingOption", exception.ParamName);
    }

    private static FeAdditionalCost CreateJobCost(int? totalNumber = 3, decimal? ratePerJob = 10m)
    {
        return FeAdditionalCost.Create(
            WeekEndingDate,
            ParkingReasonId,
            ParkingReasonCode,
            ParkingReasonText,
            ChargingOption.Job,
            totalNumber,
            ratePerJob,
            miles: null,
            ratePerMile: null);
    }

    private static FeAdditionalCost CreateMileageCost(int? miles = 20, decimal? ratePerMile = 0.45m)
    {
        return FeAdditionalCost.Create(
            WeekEndingDate,
            ExtraMileageReasonId,
            ExtraMileageReasonCode,
            ExtraMileageReasonText,
            ChargingOption.Mileage,
            totalNumber: null,
            ratePerJob: null,
            miles,
            ratePerMile);
    }
}