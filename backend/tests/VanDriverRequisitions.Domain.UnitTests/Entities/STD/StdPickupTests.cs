using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdPickupTests
{
    public static TheoryData<decimal?> MissingOrNegativeRates => [null, -0.01m];
    
    [Fact]
    public void Create_WhenMileageBased_CalculatesTotalValueAndClearsFlatCharge()
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupMileageModel(miles: 20, ratePerMile: 0.50m);

        // Act
        var pickup = StdPickup.Create(model);

        // Assert
        Assert.Equal(model.Date, pickup.Date);
        Assert.Equal(model.NumberOfBags, pickup.NumberOfBags);
        Assert.Equal(model.NumberOfHouseholds, pickup.NumberOfHouseholds);
        Assert.Equal(StdChargeType.Mileage, pickup.ChargeType);

        Assert.Equal(20, pickup.Miles);
        Assert.Equal(0.50m, pickup.RatePerMile);
        Assert.Equal(10.00m, pickup.TotalValue);

        Assert.Null(pickup.FlatCharge);
    }

    [Fact]
    public void Create_WhenFlatChargeBased_CalculatesTotalValueAndClearsMileageFields()
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupFlatChargeModel(flatCharge: 15m);

        // Act
        var pickup = StdPickup.Create(model);

        // Assert
        Assert.Equal(StdChargeType.FlatCharge, pickup.ChargeType);

        Assert.Equal(15m, pickup.FlatCharge);
        Assert.Equal(15m, pickup.TotalValue);

        Assert.Null(pickup.Miles);
        Assert.Null(pickup.RatePerMile);
    }

    [Fact]
    public void Update_WhenChangingFromMileageToFlatCharge_ClearsMileageFieldsAndRecalculatesTotalValue()
    {
        // Arrange
        var pickup = StdPickup.Create(StdRequisitionTestData.CreatePickupMileageModel(miles: 20, ratePerMile: 0.50m));

        var updateModel = StdRequisitionTestData.CreatePickupFlatChargeModel(flatCharge: 25m);

        // Act
        pickup.Update(updateModel);

        // Assert
        Assert.Equal(StdChargeType.FlatCharge, pickup.ChargeType);
        Assert.Equal(25m, pickup.FlatCharge);
        Assert.Equal(25m, pickup.TotalValue);

        Assert.Null(pickup.Miles);
        Assert.Null(pickup.RatePerMile);
    }

    [Fact]
    public void Update_WhenChangingFromFlatChargeToMileage_ClearsFlatChargeAndRecalculatesTotalValue()
    {
        // Arrange
        var pickup = StdPickup.Create(StdRequisitionTestData.CreatePickupFlatChargeModel(flatCharge: 25m));

        var updateModel = StdRequisitionTestData.CreatePickupMileageModel(miles: 12, ratePerMile: 0.50m);

        // Act
        pickup.Update(updateModel);

        // Assert
        Assert.Equal(StdChargeType.Mileage, pickup.ChargeType);
        Assert.Equal(12, pickup.Miles);
        Assert.Equal(0.50m, pickup.RatePerMile);
        Assert.Equal(6.00m, pickup.TotalValue);

        Assert.Null(pickup.FlatCharge);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WhenNumberOfBagsIsLessThanOne_ThrowsInvalidOperationException(int numberOfBags)
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupMileageModel(numberOfBags: numberOfBags);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdPickup.Create(model));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_WhenMilesIsMissingOrNotPositive_ThrowsInvalidOperationException(int? miles)
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupMileageModel(miles: miles);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdPickup.Create(model));
    }
    
    [Theory]
    [MemberData(nameof(MissingOrNegativeRates))]
    public void Create_WhenRatePerMileIsMissingOrNegative_ThrowsInvalidOperationException(decimal? ratePerMile)
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupMileageModel(ratePerMile: ratePerMile);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdPickup.Create(model));
    }

    [Fact]
    public void Create_WhenFlatChargeIsMissing_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupFlatChargeModel(flatCharge: null);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdPickup.Create(model));
    }

    [Fact]
    public void Create_WhenChargeTypeIsUnknown_ThrowsArgumentOutOfRangeException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupMileageModel() with
        {
            ChargeType = (StdChargeType)999
        };

        // Act / Assert
        Assert.Throws<ArgumentOutOfRangeException>(() => StdPickup.Create(model));
    }
    
    [Fact]
    public void Create_WhenDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreatePickupMileageModel() with
        {
            Date = default(DateOnly)
        };

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdPickup.Create(model));
    }
}