using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
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

    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Create_WhenJobBased_SnapshotsReasonAndCalculatesTotalValue()
    {
        var cost = FeAdditionalCost.Create(CreateJobModel(
            totalNumber: 3,
            ratePerJob: 10m,
            miles: 999,
            ratePerMile: 999m));

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
        var cost = FeAdditionalCost.Create(CreateMileageModel(
            totalNumber: 999,
            ratePerJob: 999m,
            miles: 20,
            ratePerMile: 0.45m));

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

        cost.Update(CreateMileageModel(
            weekEndingDate: newWeekEndingDate,
            reasonId: ExtraMileageReasonId,
            reasonCode: ExtraMileageReasonCode,
            reasonText: ExtraMileageReasonText,
            totalNumber: 999,
            ratePerJob: 999m,
            miles: 50,
            ratePerMile: 0.50m));

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

        cost.Update(CreateJobModel(
            weekEndingDate: newWeekEndingDate,
            reasonId: ParkingReasonId,
            reasonCode: ParkingReasonCode,
            reasonText: ParkingReasonText,
            totalNumber: 4,
            ratePerJob: 12.50m,
            miles: 999,
            ratePerMile: 999m));

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

        cost.Update(CreateJobModel(
            weekEndingDate: newWeekEndingDate,
            reasonId: TollReasonId,
            reasonCode: TollReasonCode,
            reasonText: TollReasonText,
            totalNumber: 6,
            ratePerJob: 7.50m,
            miles: null,
            ratePerMile: null));

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
            FeAdditionalCost.Create(CreateJobModel(
                totalNumber: totalNumber,
                ratePerJob: 10m,
                miles: null,
                ratePerMile: null)));
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Create_WhenJobRateIsMissingOrInvalid_ThrowsInvalidOperationException(decimal? ratePerJob)
    {
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(CreateJobModel(
                totalNumber: 1,
                ratePerJob: ratePerJob,
                miles: null,
                ratePerMile: null)));
    }

    [Theory]
    [InlineData(null)]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WhenMilesIsMissingOrNotPositive_ThrowsInvalidOperationException(int? miles)
    {
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(CreateMileageModel(
                totalNumber: null,
                ratePerJob: null,
                miles: miles,
                ratePerMile: 0.45m)));
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Create_WhenRatePerMileIsMissingOrInvalid_ThrowsInvalidOperationException(decimal? ratePerMile)
    {
        Assert.Throws<InvalidOperationException>(() =>
            FeAdditionalCost.Create(CreateMileageModel(
                totalNumber: null,
                ratePerJob: null,
                miles: 10,
                ratePerMile: ratePerMile)));
    }

    [Fact]
    public void Create_WhenReasonSnapshotsHaveWhitespace_TrimsReasonSnapshots()
    {
        var cost = FeAdditionalCost.Create(CreateJobModel(
            reasonCode: "  10001  ",
            reasonText: "  Parking  ",
            totalNumber: 1,
            ratePerJob: 10m,
            miles: null,
            ratePerMile: null));

        Assert.Equal(ParkingReasonCode, cost.ReasonCodeSnapshot);
        Assert.Equal(ParkingReasonText, cost.ReasonTextSnapshot);
    }

    [Fact]
    public void Create_WhenReasonCodeSnapshotIsNull_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() =>
            FeAdditionalCost.Create(CreateJobModel(reasonCode: null!)));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonCodeSnapshotIsEmptyOrWhitespace_ThrowsArgumentException(string reasonCodeSnapshot)
    {
        Assert.Throws<ArgumentException>(() =>
            FeAdditionalCost.Create(CreateJobModel(reasonCode: reasonCodeSnapshot)));
    }

    [Fact]
    public void Create_WhenReasonTextSnapshotIsNull_ThrowsArgumentNullException()
    {
        Assert.Throws<ArgumentNullException>(() =>
            FeAdditionalCost.Create(CreateJobModel(reasonText: null!)));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonTextSnapshotIsEmptyOrWhitespace_ThrowsArgumentException(string reasonTextSnapshot)
    {
        Assert.Throws<ArgumentException>(() =>
            FeAdditionalCost.Create(CreateJobModel(reasonText: reasonTextSnapshot)));
    }

    [Fact]
    public void Create_WhenChargingOptionIsUnknown_ThrowsArgumentOutOfRangeException()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            FeAdditionalCost.Create(new FeAdditionalCostUpdateModel(
                Id: null,
                WeekEndingDate,
                ParkingReasonId,
                ParkingReasonCode,
                ParkingReasonText,
                (ChargingOption)999,
                TotalNumber: 1,
                RatePerJob: 10m,
                Miles: null,
                RatePerMile: null)));
    }
    
    [Fact]
    public void Create_WhenWeekEndingDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = new FeAdditionalCostUpdateModel(
            Id: null,
            WeekEndingDate: default(DateOnly),
            ParkingReasonId,
            ParkingReasonCode,
            ParkingReasonText,
            ChargingOption.Job,
            TotalNumber: 1,
            RatePerJob: 10m,
            Miles: null,
            RatePerMile: null);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => FeAdditionalCost.Create(model));
    }

    private static FeAdditionalCost CreateJobCost(int? totalNumber = 3, decimal? ratePerJob = 10m)
    {
        return FeAdditionalCost.Create(CreateJobModel(
            totalNumber: totalNumber,
            ratePerJob: ratePerJob,
            miles: null,
            ratePerMile: null));
    }

    private static FeAdditionalCost CreateMileageCost(int? miles = 20, decimal? ratePerMile = 0.45m)
    {
        return FeAdditionalCost.Create(CreateMileageModel(
            totalNumber: null,
            ratePerJob: null,
            miles: miles,
            ratePerMile: ratePerMile));
    }

    private static FeAdditionalCostUpdateModel CreateJobModel(
        Guid? id = null,
        DateOnly? weekEndingDate = null,
        Guid? reasonId = null,
        string reasonCode = ParkingReasonCode,
        string reasonText = ParkingReasonText,
        int? totalNumber = 3,
        decimal? ratePerJob = 10m,
        int? miles = null,
        decimal? ratePerMile = null)
    {
        return new FeAdditionalCostUpdateModel(
            id,
            weekEndingDate ?? WeekEndingDate,
            reasonId ?? ParkingReasonId,
            reasonCode,
            reasonText,
            ChargingOption.Job,
            totalNumber,
            ratePerJob,
            miles,
            ratePerMile);
    }

    private static FeAdditionalCostUpdateModel CreateMileageModel(
        Guid? id = null,
        DateOnly? weekEndingDate = null,
        Guid? reasonId = null,
        string reasonCode = ExtraMileageReasonCode,
        string reasonText = ExtraMileageReasonText,
        int? totalNumber = null,
        decimal? ratePerJob = null,
        int? miles = 20,
        decimal? ratePerMile = 0.45m)
    {
        return new FeAdditionalCostUpdateModel(
            id,
            weekEndingDate ?? WeekEndingDate,
            reasonId ?? ExtraMileageReasonId,
            reasonCode,
            reasonText,
            ChargingOption.Mileage,
            totalNumber,
            ratePerJob,
            miles,
            ratePerMile);
    }
}