using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdAdditionalCostTests
{
    [Fact]
    public void Create_WhenFlatChargeBased_SnapshotsReasonAndCalculatesTotalValue()
    {
        var reasonId = Guid.NewGuid();

        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(
            reasonId: reasonId,
            reasonCode: "  10001  ",
            reasonText: "  Parking  ",
            numberOfBags: 2,
            flatCharge: 7.50m);

        var cost = StdAdditionalCost.Create(model);

        Assert.Equal(model.Date, cost.Date);
        Assert.Equal(reasonId, cost.ReasonId);
        Assert.Equal("10001", cost.ReasonCodeSnapshot);
        Assert.Equal("Parking", cost.ReasonTextSnapshot);
        Assert.Equal(2, cost.NumberOfBags);

        Assert.Equal(StdChargeType.FlatCharge, cost.ChargeType);
        Assert.Equal(7.50m, cost.FlatCharge);
        Assert.Equal(7.50m, cost.TotalValue);

        Assert.Null(cost.Miles);
        Assert.Null(cost.RatePerMile);
    }

    [Fact]
    public void Create_WhenMileageBased_CalculatesTotalValueAndClearsFlatCharge()
    {
        var model = StdRequisitionTestData.CreateAdditionalMileageCostModel(miles: 10, ratePerMile: 0.45m);

        var cost = StdAdditionalCost.Create(model);

        Assert.Equal(StdChargeType.Mileage, cost.ChargeType);
        Assert.Equal(10, cost.Miles);
        Assert.Equal(0.45m, cost.RatePerMile);
        Assert.Equal(4.50m, cost.TotalValue);

        Assert.Null(cost.FlatCharge);
    }

    [Fact]
    public void Create_WhenReasonIdIsEmpty_ThrowsInvalidOperationException()
    {
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(reasonId: Guid.Empty);

        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonCodeSnapshotIsMissing_ThrowsArgumentException(string? reasonCode)
    {
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(reasonCode: reasonCode!);

        Assert.ThrowsAny<ArgumentException>(() => StdAdditionalCost.Create(model));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonTextSnapshotIsMissing_ThrowsArgumentException(string? reasonText)
    {
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(reasonText: reasonText!);

        Assert.ThrowsAny<ArgumentException>(() => StdAdditionalCost.Create(model));
    }

    [Fact]
    public void Create_WhenNumberOfBagsIsNegative_ThrowsInvalidOperationException()
    {
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(numberOfBags: -1);

        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }

    [Fact]
    public void Create_WhenNumberOfBagsIsZero_ThrowsInvalidOperationException()
    {
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(numberOfBags: 0);

        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }
    
    [Fact]
    public void Create_WhenDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel() with
        {
            Date = default(DateOnly)
        };

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }
}