using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdAdditionalCostTests
{
    [Fact]
    public void Create_WhenFlatChargeBased_SetsReasonAndCalculatesTotalValue()
    {
        // Arrange
        var reasonId = Guid.NewGuid();

        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(
            reasonId: reasonId,
            reasonName: "  Parking  ",
            numberOfBags: 2,
            flatCharge: 7.50m);

        // Act
        var cost = StdAdditionalCost.Create(model);

        // Assert
        Assert.Equal(model.Date, cost.Date);
        Assert.Equal(reasonId, cost.ReasonId);
        Assert.Equal("Parking", cost.ReasonNameSnapshot);
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
        // Arrange
        var model = StdRequisitionTestData.CreateAdditionalMileageCostModel(miles: 10, ratePerMile: 0.45m);

        // Act
        var cost = StdAdditionalCost.Create(model);

        // Assert
        Assert.Equal(StdChargeType.Mileage, cost.ChargeType);
        Assert.Equal(10, cost.Miles);
        Assert.Equal(0.45m, cost.RatePerMile);
        Assert.Equal(4.50m, cost.TotalValue);

        Assert.Null(cost.FlatCharge);
    }

    [Fact]
    public void Create_WhenReasonIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(reasonId: Guid.Empty);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenReasonNameIsMissing_ThrowsArgumentException(string? reasonName)
    {
        // Arrange
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(reasonName: reasonName!);

        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() => StdAdditionalCost.Create(model));
    }

    [Fact]
    public void Create_WhenNumberOfBagsIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(numberOfBags: -1);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }
    
    [Fact]
    public void Create_WhenNumberOfBagsIsZero_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(numberOfBags: 0);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdAdditionalCost.Create(model));
    }
}