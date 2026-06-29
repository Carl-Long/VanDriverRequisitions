using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Domain.UnitTests.Helpers;

public sealed class SnapshotGuardTests
{
    [Fact]
    public void EnsureRequiredShop_WhenValid_ReturnsTrimmedSnapshot()
    {
        // Arrange
        var id = Guid.NewGuid();
        var snapshot = new ShopSnapshot(id, "  S001  ", "  Test Shop  ");

        // Act
        var result = SnapshotGuard.EnsureRequiredShop(snapshot, "Shop");

        // Assert
        Assert.Equal(id, result.Id);
        Assert.Equal("S001", result.Code);
        Assert.Equal("Test Shop", result.Name);
    }

    [Fact]
    public void EnsureRequiredShop_WhenSnapshotIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            SnapshotGuard.EnsureRequiredShop(null!, "Shop"));

        // Assert
        Assert.Equal("Shop", exception.ParamName);
    }

    [Fact]
    public void EnsureRequiredShop_WhenIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var snapshot = new ShopSnapshot(Guid.Empty, "S001", "Test Shop");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            SnapshotGuard.EnsureRequiredShop(snapshot, "Shop"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void EnsureRequiredShop_WhenCodeIsMissing_ThrowsArgumentException(string? code)
    {
        // Arrange
        var snapshot = new ShopSnapshot(Guid.NewGuid(), code!, "Test Shop");

        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            SnapshotGuard.EnsureRequiredShop(snapshot, "Shop"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void EnsureRequiredShop_WhenNameIsMissing_ThrowsArgumentException(string? name)
    {
        // Arrange
        var snapshot = new ShopSnapshot(Guid.NewGuid(), "S001", name!);

        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            SnapshotGuard.EnsureRequiredShop(snapshot, "Shop"));
    }

    [Fact]
    public void EnsureRequiredVanDriver_WhenValid_ReturnsTrimmedSnapshot()
    {
        // Arrange
        var id = Guid.NewGuid();
        var snapshot = new VanDriverSnapshot(
            id,
            "  VD001  ",
            "  John Smith  ",
            "  John Smith Trading  ",
            HasVat: true);

        // Act
        var result = SnapshotGuard.EnsureRequiredVanDriver(snapshot, "Driver");

        // Assert
        Assert.Equal(id, result.Id);
        Assert.Equal("VD001", result.Code);
        Assert.Equal("John Smith", result.Name);
        Assert.Equal("John Smith Trading", result.TradersName);
        Assert.True(result.HasVat);
    }

    [Fact]
    public void EnsureRequiredVanDriver_WhenSnapshotIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            SnapshotGuard.EnsureRequiredVanDriver(null!, "Driver"));

        // Assert
        Assert.Equal("Driver", exception.ParamName);
    }

    [Fact]
    public void EnsureRequiredVanDriver_WhenIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var snapshot = new VanDriverSnapshot(
            Guid.Empty,
            "VD001",
            "John Smith",
            "John Smith Trading",
            HasVat: true);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            SnapshotGuard.EnsureRequiredVanDriver(snapshot, "Driver"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void EnsureRequiredVanDriver_WhenCodeIsMissing_ThrowsArgumentException(string? code)
    {
        // Arrange
        var snapshot = new VanDriverSnapshot(
            Guid.NewGuid(),
            code!,
            "John Smith",
            "John Smith Trading",
            HasVat: true);

        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            SnapshotGuard.EnsureRequiredVanDriver(snapshot, "Driver"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void EnsureRequiredVanDriver_WhenNameIsMissing_ThrowsArgumentException(string? name)
    {
        // Arrange
        var snapshot = new VanDriverSnapshot(
            Guid.NewGuid(),
            "VD001",
            name!,
            "John Smith Trading",
            HasVat: true);

        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            SnapshotGuard.EnsureRequiredVanDriver(snapshot, "Driver"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void EnsureRequiredVanDriver_WhenTradersNameIsMissing_ThrowsArgumentException(string? tradersName)
    {
        // Arrange
        var snapshot = new VanDriverSnapshot(
            Guid.NewGuid(),
            "VD001",
            "John Smith",
            tradersName!,
            HasVat: true);

        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            SnapshotGuard.EnsureRequiredVanDriver(snapshot, "Driver"));
    }
    
    [Fact]
    public void EnsureRequiredId_WhenIdIsValid_ReturnsId()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var result = SnapshotGuard.EnsureRequiredId(id, "Reason id");

        // Assert
        Assert.Equal(id, result);
    }

    [Fact]
    public void EnsureRequiredId_WhenIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Act
        var exception = Assert.Throws<InvalidOperationException>(() =>
            SnapshotGuard.EnsureRequiredId(Guid.Empty, "Reason id"));

        // Assert
        Assert.Equal("Reason id is required.", exception.Message);
    }

    [Fact]
    public void EnsureRequiredText_WhenValueIsValid_ReturnsTrimmedValue()
    {
        // Act
        var result = SnapshotGuard.EnsureRequiredText("  Parking  ", "Reason text");

        // Assert
        Assert.Equal("Parking", result);
    }

    [Fact]
    public void EnsureRequiredText_WhenValueIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            SnapshotGuard.EnsureRequiredText(null, "Reason text"));

        // Assert
        Assert.Equal("Reason text", exception.ParamName);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void EnsureRequiredText_WhenValueIsEmptyOrWhitespace_ThrowsArgumentException(string value)
    {
        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            SnapshotGuard.EnsureRequiredText(value, "Reason text"));

        // Assert
        Assert.Equal("Reason text", exception.ParamName);
    }
}