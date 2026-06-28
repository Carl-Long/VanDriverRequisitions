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
    
    [Fact]
    public void EnsureRequiredUtcDateTime_WhenDateTimeIsValidUtc_ReturnsDateTime()
    {
        // Arrange
        var dateTime = new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc);

        // Act
        var result = DateGuard.EnsureRequiredUtcDateTime(dateTime, "Submitted at UTC");

        // Assert
        Assert.Equal(dateTime, result);
    }

    [Fact]
    public void EnsureRequiredUtcDateTime_WhenDateTimeIsDefault_ThrowsInvalidOperationException()
    {
        // Act
        var exception = Assert.Throws<InvalidOperationException>(() =>
            DateGuard.EnsureRequiredUtcDateTime(default, "Submitted at UTC"));

        // Assert
        Assert.Equal("Submitted at UTC is required.", exception.Message);
    }

    [Theory]
    [InlineData(DateTimeKind.Local)]
    [InlineData(DateTimeKind.Unspecified)]
    public void EnsureRequiredUtcDateTime_WhenDateTimeIsNotUtc_ThrowsInvalidOperationException(DateTimeKind kind)
    {
        // Arrange
        var dateTime = new DateTime(2026, 6, 13, 10, 0, 0, kind);

        // Act
        var exception = Assert.Throws<InvalidOperationException>(() =>
            DateGuard.EnsureRequiredUtcDateTime(dateTime, "Submitted at UTC"));

        // Assert
        Assert.Equal("Submitted at UTC must be UTC.", exception.Message);
    }
}