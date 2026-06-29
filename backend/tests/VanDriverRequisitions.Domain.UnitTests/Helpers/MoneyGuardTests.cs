using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Domain.UnitTests.Helpers;

public sealed class MoneyGuardTests
{
    [Fact]
    public void EnsureMoneyAmount_WhenValueIsOnePenny_ReturnsValue()
    {
        // Act
        var result = MoneyGuard.EnsureMoneyAmount(0.01m, "Rate");

        // Assert
        Assert.Equal(0.01m, result);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-0.01)]
    public void EnsureMoneyAmount_WhenValueIsLessThanOnePenny_ThrowsInvalidOperationException(decimal value)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => MoneyGuard.EnsureMoneyAmount(value, "Rate"));
    }

    [Theory]
    [InlineData(0.001)]
    [InlineData(1.234)]
    public void EnsureMoneyAmount_WhenValueHasMoreThanTwoDecimalPlaces_ThrowsInvalidOperationException(decimal value)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => MoneyGuard.EnsureMoneyAmount(value, "Rate"));
    }

    [Fact]
    public void EnsureRequiredMoneyAmount_WhenValueIsNull_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => MoneyGuard.EnsureRequiredMoneyAmount(null, "Rate"));
    }

    [Fact]
    public void EnsureRequiredMoneyAmount_WhenValueIsValid_ReturnsValue()
    {
        // Act
        var result = MoneyGuard.EnsureRequiredMoneyAmount(2.50m, "Rate");

        // Assert
        Assert.Equal(2.50m, result);
    }

    [Fact]
    public void EnsureOptionalMoneyAmount_WhenValueIsNull_ReturnsNull()
    {
        // Act
        var result = MoneyGuard.EnsureOptionalMoneyAmount(null, "Rate");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void EnsureOptionalMoneyAmount_WhenValueIsValid_ReturnsValue()
    {
        // Act
        var result = MoneyGuard.EnsureOptionalMoneyAmount(1.25m, "Rate");

        // Assert
        Assert.Equal(1.25m, result);
    }

    [Theory]
    [InlineData(0.01, true)]
    [InlineData(1.23, true)]
    [InlineData(1.234, false)]
    [InlineData(0.001, false)]
    public void HasMaxTwoDecimalPlaces_ReturnsExpectedResult(decimal value, bool expected)
    {
        // Act
        var result = MoneyGuard.HasMaxTwoDecimalPlaces(value);

        // Assert
        Assert.Equal(expected, result);
    }
}