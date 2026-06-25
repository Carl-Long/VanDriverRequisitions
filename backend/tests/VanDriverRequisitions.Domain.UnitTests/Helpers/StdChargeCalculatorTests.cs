using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Domain.UnitTests.Helpers;

public sealed class StdChargeCalculatorTests
{
    public static TheoryData<int?> MissingOrNotPositiveMiles => [null, 0, -1];

    public static TheoryData<decimal?> MissingOrInvalidRates => [null, 0m, 0.001m, -0.01m];

    public static TheoryData<decimal?> MissingOrInvalidFlatCharges => [null, 0m, 0.001m, -0.01m];

    [Fact]
    public void Calculate_WhenMileageBased_ReturnsMileageChargeAndClearsFlatCharge()
    {
        // Act
        var charge = StdChargeCalculator.Calculate(StdChargeType.Mileage, miles: 20, ratePerMile: 0.50m, flatCharge: 999m);

        // Assert
        Assert.Equal(20, charge.Miles);
        Assert.Equal(0.50m, charge.RatePerMile);
        Assert.Null(charge.FlatCharge);
        Assert.Equal(10.00m, charge.TotalValue);
    }

    [Fact]
    public void Calculate_WhenFlatChargeBased_ReturnsFlatChargeAndClearsMileageFields()
    {
        // Act
        var charge = StdChargeCalculator.Calculate(StdChargeType.FlatCharge, miles: 999, ratePerMile: 999m, flatCharge: 12.50m);

        // Assert
        Assert.Null(charge.Miles);
        Assert.Null(charge.RatePerMile);
        Assert.Equal(12.50m, charge.FlatCharge);
        Assert.Equal(12.50m, charge.TotalValue);
    }

    [Theory]
    [MemberData(nameof(MissingOrNotPositiveMiles))]
    public void Calculate_WhenMileageMilesAreMissingOrNotPositive_ThrowsInvalidOperationException(int? miles)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            StdChargeCalculator.Calculate(
                StdChargeType.Mileage,
                miles,
                ratePerMile: 0.50m,
                flatCharge: null));
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidRates))]
    public void Calculate_WhenMileageRateIsMissingOrInvalid_ThrowsInvalidOperationException(decimal? ratePerMile)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            StdChargeCalculator.Calculate(
                StdChargeType.Mileage,
                miles: 10,
                ratePerMile,
                flatCharge: null));
    }

    [Theory]
    [MemberData(nameof(MissingOrInvalidFlatCharges))]
    public void Calculate_WhenFlatChargeIsMissingOrInvalid_ThrowsInvalidOperationException(decimal? flatCharge)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            StdChargeCalculator.Calculate(
                StdChargeType.FlatCharge,
                miles: null,
                ratePerMile: null,
                flatCharge));
    }

    [Fact]
    public void Calculate_WhenChargeTypeIsUnknown_ThrowsArgumentOutOfRangeException()
    {
        // Act
        var exception = Assert.Throws<ArgumentOutOfRangeException>(() =>
            StdChargeCalculator.Calculate(
                (StdChargeType)999,
                miles: 10,
                ratePerMile: 0.50m,
                flatCharge: null));

        // Assert
        Assert.Equal("chargeType", exception.ParamName);
    }
}