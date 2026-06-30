using Moq;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Requisitions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Common.Requisitions;

public sealed class RequisitionLookupLoaderExtensionsTests
{
    [Fact]
    public async Task LoadShopActiveMapAsync_WhenIdsAreEmpty_ReturnsEmptyDictionaryAndDoesNotCallLoader()
    {
        // Arrange
        var loader = new Mock<IRequisitionLookupLoader>();

        // Act
        var result = await loader.Object.LoadShopActiveMapAsync([], CancellationToken.None);

        // Assert
        Assert.Empty(result);

        loader.Verify(
            x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<bool>()),
            Times.Never);
    }

    [Fact]
    public async Task LoadShopActiveMapAsync_DistinctsIdsAndMapsActiveState()
    {
        // Arrange
        var activeShopId = Guid.NewGuid();
        var inactiveShopId = Guid.NewGuid();

        List<Guid>? requestedIds = null;

        var loader = new Mock<IRequisitionLookupLoader>();

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .Callback<IEnumerable<Guid>, CancellationToken, bool>((ids, _, _) =>
            {
                requestedIds = ids.ToList();
            })
            .ReturnsAsync(new Dictionary<Guid, ShopRequisitionSnapshotDto>
            {
                [activeShopId] = new()
                {
                    Id = activeShopId,
                    Code = "S001",
                    Name = "Active Shop",
                    IsActive = true,
                },
                [inactiveShopId] = new()
                {
                    Id = inactiveShopId,
                    Code = "S002",
                    Name = "Inactive Shop",
                    IsActive = false,
                },
            });

        // Act
        var result = await loader.Object.LoadShopActiveMapAsync(
            [activeShopId, activeShopId, inactiveShopId],
            CancellationToken.None);

        // Assert
        Assert.True(result[activeShopId]);
        Assert.False(result[inactiveShopId]);

        Assert.NotNull(requestedIds);
        Assert.Equal(2, requestedIds.Count);
        Assert.Contains(activeShopId, requestedIds);
        Assert.Contains(inactiveShopId, requestedIds);

        loader.Verify(
            x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true),
            Times.Once);
    }

    [Fact]
    public async Task LoadCostReasonActiveMapAsync_WhenIdsAreEmpty_ReturnsEmptyDictionaryAndDoesNotCallLoader()
    {
        // Arrange
        var loader = new Mock<IRequisitionLookupLoader>();

        // Act
        var result = await loader.Object.LoadCostReasonActiveMapAsync([], CancellationToken.None);

        // Assert
        Assert.Empty(result);

        loader.Verify(
            x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<bool>()),
            Times.Never);
    }

    [Fact]
    public async Task LoadCostReasonActiveMapAsync_DistinctsIdsAndMapsActiveState()
    {
        // Arrange
        var activeReasonId = Guid.NewGuid();
        var inactiveReasonId = Guid.NewGuid();

        List<Guid>? requestedIds = null;

        var loader = new Mock<IRequisitionLookupLoader>();

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .Callback<IEnumerable<Guid>, CancellationToken, bool>((ids, _, _) =>
            {
                requestedIds = ids.ToList();
            })
            .ReturnsAsync(new Dictionary<Guid, CostReason>
            {
                [activeReasonId] = new()
                {
                    Id = activeReasonId,
                    Code = "10001",
                    Reason = "Active Reason",
                    Scope = CostReasonScope.Shared,
                    IsActive = true,
                },
                [inactiveReasonId] = new()
                {
                    Id = inactiveReasonId,
                    Code = "10002",
                    Reason = "Inactive Reason",
                    Scope = CostReasonScope.Shared,
                    IsActive = false,
                },
            });

        // Act
        var result = await loader.Object.LoadCostReasonActiveMapAsync(
            [activeReasonId, activeReasonId, inactiveReasonId],
            CancellationToken.None);

        // Assert
        Assert.True(result[activeReasonId]);
        Assert.False(result[inactiveReasonId]);

        Assert.NotNull(requestedIds);
        Assert.Equal(2, requestedIds.Count);
        Assert.Contains(activeReasonId, requestedIds);
        Assert.Contains(inactiveReasonId, requestedIds);

        loader.Verify(
            x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true),
            Times.Once);
    }

    [Fact]
    public async Task LoadStdCollectionTypeActiveMapAsync_WhenIdsAreEmpty_ReturnsEmptyDictionaryAndDoesNotCallLoader()
    {
        // Arrange
        var loader = new Mock<IRequisitionLookupLoader>();

        // Act
        var result = await loader.Object.LoadStdCollectionTypeActiveMapAsync([], CancellationToken.None);

        // Assert
        Assert.Empty(result);

        loader.Verify(
            x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<bool>()),
            Times.Never);
    }

    [Fact]
    public async Task LoadStdCollectionTypeActiveMapAsync_DistinctsIdsAndMapsActiveState()
    {
        // Arrange
        var activeCollectionTypeId = Guid.NewGuid();
        var inactiveCollectionTypeId = Guid.NewGuid();

        List<Guid>? requestedIds = null;

        var loader = new Mock<IRequisitionLookupLoader>();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .Callback<IEnumerable<Guid>, CancellationToken, bool>((ids, _, _) =>
            {
                requestedIds = ids.ToList();
            })
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [activeCollectionTypeId] = new()
                {
                    Id = activeCollectionTypeId,
                    Code = "2389",
                    Name = "Active Collection Type",
                    IsActive = true,
                },
                [inactiveCollectionTypeId] = new()
                {
                    Id = inactiveCollectionTypeId,
                    Code = "2390",
                    Name = "Inactive Collection Type",
                    IsActive = false,
                },
            });

        // Act
        var result = await loader.Object.LoadStdCollectionTypeActiveMapAsync(
            [activeCollectionTypeId, activeCollectionTypeId, inactiveCollectionTypeId],
            CancellationToken.None);

        // Assert
        Assert.True(result[activeCollectionTypeId]);
        Assert.False(result[inactiveCollectionTypeId]);

        Assert.NotNull(requestedIds);
        Assert.Equal(2, requestedIds.Count);
        Assert.Contains(activeCollectionTypeId, requestedIds);
        Assert.Contains(inactiveCollectionTypeId, requestedIds);

        loader.Verify(
            x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true),
            Times.Once);
    }

    [Fact]
    public async Task LoadStdLocationActiveMapAsync_WhenIdsAreEmpty_ReturnsEmptyDictionaryAndDoesNotCallLoader()
    {
        // Arrange
        var loader = new Mock<IRequisitionLookupLoader>();

        // Act
        var result = await loader.Object.LoadStdLocationActiveMapAsync([], CancellationToken.None);

        // Assert
        Assert.Empty(result);

        loader.Verify(
            x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                It.IsAny<bool>()),
            Times.Never);
    }

    [Fact]
    public async Task LoadStdLocationActiveMapAsync_DistinctsIdsAndMapsActiveState()
    {
        // Arrange
        var activeLocationId = Guid.NewGuid();
        var inactiveLocationId = Guid.NewGuid();

        var shopId = Guid.NewGuid();
        var collectionTypeId = Guid.NewGuid();

        List<Guid>? requestedIds = null;

        var loader = new Mock<IRequisitionLookupLoader>();

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .Callback<IEnumerable<Guid>, CancellationToken, bool>((ids, _, _) =>
            {
                requestedIds = ids.ToList();
            })
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [activeLocationId] = CreateStdLocation(
                    activeLocationId,
                    shopId,
                    collectionTypeId,
                    "Active Location",
                    "AB1 2CD",
                    isActive: true),
                [inactiveLocationId] = CreateStdLocation(
                    inactiveLocationId,
                    shopId,
                    collectionTypeId,
                    "Inactive Location",
                    "AB1 2CE",
                    isActive: false),
            });

        // Act
        var result = await loader.Object.LoadStdLocationActiveMapAsync(
            [activeLocationId, activeLocationId, inactiveLocationId],
            CancellationToken.None);

        // Assert
        Assert.True(result[activeLocationId]);
        Assert.False(result[inactiveLocationId]);

        Assert.NotNull(requestedIds);
        Assert.Equal(2, requestedIds.Count);
        Assert.Contains(activeLocationId, requestedIds);
        Assert.Contains(inactiveLocationId, requestedIds);

        loader.Verify(
            x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true),
            Times.Once);
    }

    private static StdLocation CreateStdLocation(
        Guid id,
        Guid shopId,
        Guid collectionTypeId,
        string locationName,
        string postCode,
        bool isActive)
    {
        var location = StdLocation.Create(
            shopId,
            collectionTypeId,
            locationName,
            postCode);

        location.Id = id;

        if (!isActive)
        {
            location.Deactivate();
        }

        return location;
    }
}