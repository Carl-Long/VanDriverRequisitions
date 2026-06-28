using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Domain.UnitTests.Helpers;

public sealed class DateGuardTests
{
    [Fact]
    public void EnsureRequiredDateOnly_WhenDateIsValid_ReturnsDate()
    {
        // Arrange
        var date = new DateOnly(2026, 6, 13);

        // Act
        var result = DateGuard.EnsureRequiredDate(date, "Date");

        // Assert
        Assert.Equal(date, result);
    }

    [Fact]
    public void EnsureRequiredDateOnly_WhenDateIsDefault_ThrowsInvalidOperationException()
    {
        // Act
        var exception = Assert.Throws<InvalidOperationException>(() =>
            DateGuard.EnsureRequiredDate(default, "Date"));

        // Assert
        Assert.Equal("Date is required.", exception.Message);
    }
}