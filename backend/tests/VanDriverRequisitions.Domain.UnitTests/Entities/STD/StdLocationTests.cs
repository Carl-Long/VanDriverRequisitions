using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdLocationTests
{
    [Fact]
    public void Create_WhenValid_SetsPropertiesAndIsActive()
    {
        // Arrange
        var shopId = Guid.NewGuid();
        var collectionTypeId = Guid.NewGuid();

        // Act
        var location = StdLocation.Create(shopId, collectionTypeId, "  Main Entrance  ", " ab12 3cd ");

        // Assert
        Assert.Equal(shopId, location.ShopId);
        Assert.Equal(collectionTypeId, location.CollectionTypeId);
        Assert.Equal("Main Entrance", location.LocationName);
        Assert.Equal("AB12 3CD", location.PostCode);
        Assert.True(location.IsActive);
    }

    [Fact]
    public void Create_WhenShopIdIsEmpty_ThrowsArgumentException()
    {
        // Act / Assert
        Assert.Throws<ArgumentException>(() =>
            StdLocation.Create(Guid.Empty, Guid.NewGuid(), "Main Entrance", "AB12 3CD"));
    }

    [Fact]
    public void Create_WhenCollectionTypeIdIsEmpty_ThrowsArgumentException()
    {
        // Act / Assert
        Assert.Throws<ArgumentException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.Empty, "Main Entrance", "AB12 3CD"));
    }

    [Fact]
    public void Create_WhenLocationNameIsNull_ThrowsArgumentNullException()
    {
        // Act / Assert
        Assert.Throws<ArgumentNullException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), null!, "AB12 3CD"));
    }

    [Fact]
    public void Create_WhenLocationNameIsEmpty_ThrowsArgumentNullException()
    {
        // Act / Assert
        Assert.Throws<ArgumentNullException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), string.Empty, "AB12 3CD"));
    }

    [Fact]
    public void Create_WhenLocationNameIsWhitespace_ThrowsArgumentNullException()
    {
        // Act / Assert
        Assert.Throws<ArgumentNullException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "   ", "AB12 3CD"));
    }

    [Fact]
    public void Create_WhenPostCodeIsNull_ThrowsArgumentNullException()
    {
        // Act / Assert
        Assert.Throws<ArgumentNullException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "Main Entrance", null!));
    }

    [Fact]
    public void Create_WhenPostCodeIsEmpty_ThrowsArgumentNullException()
    {
        // Act / Assert
        Assert.Throws<ArgumentNullException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "Main Entrance", string.Empty));
    }

    [Fact]
    public void Create_WhenPostCodeIsWhitespace_ThrowsArgumentNullException()
    {
        // Act / Assert
        Assert.Throws<ArgumentNullException>(() =>
            StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "Main Entrance", "   "));
    }

    [Fact]
    public void UpdateDetails_WhenValid_UpdatesProperties()
    {
        // Arrange
        var location = StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "Old Location", "AA1 1AA");

        var newShopId = Guid.NewGuid();
        var newCollectionTypeId = Guid.NewGuid();

        // Act
        location.UpdateDetails(newShopId, newCollectionTypeId, "  New Location  ", " bb2 2bb ");

        // Assert
        Assert.Equal(newShopId, location.ShopId);
        Assert.Equal(newCollectionTypeId, location.CollectionTypeId);
        Assert.Equal("New Location", location.LocationName);
        Assert.Equal("BB2 2BB", location.PostCode);
    }

    [Fact]
    public void Deactivate_SetsIsActiveFalse()
    {
        // Arrange
        var location = StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "Main Entrance", "AB12 3CD");

        // Act
        location.Deactivate();

        // Assert
        Assert.False(location.IsActive);
    }

    [Fact]
    public void Activate_SetsIsActiveTrue()
    {
        // Arrange
        var location = StdLocation.Create(Guid.NewGuid(), Guid.NewGuid(), "Main Entrance", "AB12 3CD");
        location.Deactivate();

        // Act
        location.Activate();

        // Assert
        Assert.True(location.IsActive);
    }
}