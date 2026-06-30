using System.Reflection;
using FluentValidation;
using Moq;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Builders;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Builders;

public sealed class StdRequisitionSaveDataBuilderTests
{
    private static readonly Guid DriverId = Guid.NewGuid();
    private static readonly Guid ShopId = Guid.NewGuid();
    private static readonly Guid CollectionTypeId = Guid.NewGuid();
    private static readonly Guid LocationId = Guid.NewGuid();
    private static readonly Guid ReasonId = Guid.NewGuid();
    private static readonly Guid FromShopId = Guid.NewGuid();
    private static readonly Guid ToShopId = Guid.NewGuid();

    [Fact]
    public async Task BuildAsync_WhenLookupsExist_MapsDetailsAndDriverSummary()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var builder = new StdRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto();

        // Act
        var result = await builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None);

        // Assert
        Assert.Equal(DriverId, result.DriverSummary.Id);
        Assert.True(result.IsShopActive);

        Assert.Equal(dto.RequisitionDate, result.UpdateModel.Details.RequisitionDate);

        Assert.Equal(DriverId, result.UpdateModel.Details.Driver.Id);
        Assert.Equal("VD001", result.UpdateModel.Details.Driver.Code);
        Assert.Equal("Standard Driver", result.UpdateModel.Details.Driver.Name);
        Assert.Equal("Test Driver Trading", result.UpdateModel.Details.Driver.TradersName);
        Assert.True(result.UpdateModel.Details.Driver.HasVat);

        Assert.Equal(ShopId, result.UpdateModel.Details.Shop.Id);
        Assert.Equal("S001", result.UpdateModel.Details.Shop.Code);
        Assert.Equal("Main Shop", result.UpdateModel.Details.Shop.Name);
    }

    [Fact]
    public async Task BuildAsync_WhenCollectionTypeAndLocationExist_MapsCollectionChargeSnapshots()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(LocationId, ShopId, CollectionTypeId)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto()]);

        // Act
        var result = await builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None);

        // Assert
        var charge = Assert.Single(result.UpdateModel.CollectionChargesBanksAndBins);

        Assert.Equal(CollectionTypeId, charge.CollectionTypeId);
        Assert.Equal("2389", charge.CollectionTypeCode);
        Assert.Equal("Banks & Bins", charge.CollectionTypeName);

        Assert.Equal(LocationId, charge.LocationId);
        Assert.Equal(ShopId, charge.LocationShopId);
        Assert.Equal(CollectionTypeId, charge.LocationCollectionTypeId);
        Assert.Equal("Test Location", charge.LocationName);
        Assert.Equal("AB1 2CD", charge.LocationPostCode);
    }

    [Fact]
    public async Task BuildAsync_WhenCollectionTypeIsMissing_ThrowsNotFoundException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(LocationId, ShopId, CollectionTypeId)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenNewCollectionChargeUsesInactiveCollectionType_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId, isActive: false)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(LocationId, ShopId, CollectionTypeId)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenExistingCollectionChargeUsesInactiveCollectionType_AllowsSave()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId, isActive: false)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(LocationId, ShopId, CollectionTypeId)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        
        var existingRequisition = CreateExistingRequisition(
            collectionChargeId: existingRowId,
            collectionTypeId: CollectionTypeId,
            locationId: LocationId);

        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto(id: existingRowId)]);

        // Act
        var result = await builder.BuildAsync(dto, existingRequisition, CancellationToken.None);

        // Assert
        var charge = Assert.Single(result.UpdateModel.CollectionChargesBanksAndBins);

        Assert.Equal(CollectionTypeId, charge.CollectionTypeId);
        Assert.Equal("2389", charge.CollectionTypeCode);
        Assert.Equal("Banks & Bins", charge.CollectionTypeName);
    }
    
    [Fact]
    public async Task BuildAsync_WhenExistingCollectionChargeChangesToInactiveCollectionType_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        var existingCollectionTypeId = Guid.NewGuid();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(
                    CollectionTypeId,
                    isActive: false)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(
                    LocationId,
                    ShopId,
                    CollectionTypeId)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();

        var existingRequisition = CreateExistingRequisition(
            collectionChargeId: existingRowId,
            collectionTypeId: existingCollectionTypeId,
            locationId: LocationId);

        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto(id: existingRowId)]);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, existingRequisition, CancellationToken.None));

        // Assert
        Assert.Equal("STD collection type '2389 - Banks & Bins' is inactive and cannot be selected.", exception.Message);
    }

    [Fact]
    public async Task BuildAsync_WhenLocationIsMissing_ThrowsNotFoundException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenNewCollectionChargeUsesInactiveLocation_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(
                    LocationId,
                    ShopId,
                    CollectionTypeId,
                    isActive: false)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenExistingCollectionChargeUsesInactiveLocation_AllowsSave()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(LocationId, ShopId, CollectionTypeId, isActive: false)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        var existingRequisition = CreateExistingRequisition(collectionChargeId: existingRowId, collectionTypeId: CollectionTypeId, locationId: LocationId);
        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto(id: existingRowId)]);

        // Act
        var result = await builder.BuildAsync(dto, existingRequisition, CancellationToken.None);

        // Assert
        var charge = Assert.Single(result.UpdateModel.CollectionChargesBanksAndBins);

        Assert.Equal(LocationId, charge.LocationId);
        Assert.Equal("Test Location", charge.LocationName);
        Assert.Equal("AB1 2CD", charge.LocationPostCode);
    }
    
    [Fact]
    public async Task BuildAsync_WhenExistingCollectionChargeChangesToInactiveLocation_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var existingLocationId = Guid.NewGuid();

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>
            {
                [CollectionTypeId] = RequisitionBuilderTestData.CreateStdCollectionType(CollectionTypeId)
            });

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>
            {
                [LocationId] = RequisitionBuilderTestData.CreateStdLocation(LocationId, ShopId, CollectionTypeId, isActive: false) 
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        var existingRequisition = CreateExistingRequisition(collectionChargeId: existingRowId, collectionTypeId: CollectionTypeId, locationId: existingLocationId);
        var dto = CreateDto(collectionCharges: [CreateCollectionChargeDto(id: existingRowId)]);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, existingRequisition, CancellationToken.None));

        // Assert
        Assert.Equal("STD location 'Test Location' is inactive and cannot be selected.", exception.Message);
    }
    

    [Fact]
    public async Task BuildAsync_WhenAdditionalCostReasonExists_MapsReasonSnapshot()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, CostReason>
            {
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Std)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto()]);

        // Act
        var result = await builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None);

        // Assert
        var cost = Assert.Single(result.UpdateModel.AdditionalCosts);

        Assert.Equal(ReasonId, cost.ReasonId);
        Assert.Equal("10001", cost.ReasonCodeSnapshot);
        Assert.Equal("Parking", cost.ReasonTextSnapshot);
    }

    [Fact]
    public async Task BuildAsync_WhenAdditionalCostReasonIsMissing_ThrowsNotFoundException()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenAdditionalCostReasonIsFeOnly_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, CostReason>
            {
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Fe)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenNewAdditionalCostUsesInactiveReason_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, CostReason>
            {
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Std, isActive: false)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenExistingAdditionalCostUsesInactiveReason_AllowsSave()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, CostReason>
            {
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Std, isActive: false)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        var existingRequisition = CreateExistingRequisition(additionalCostId: existingRowId, reasonId: ReasonId);
        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto(id: existingRowId)]);

        // Act
        var result = await builder.BuildAsync(dto, existingRequisition, CancellationToken.None);

        // Assert
        var cost = Assert.Single(result.UpdateModel.AdditionalCosts);

        Assert.Equal(ReasonId, cost.ReasonId);
        Assert.Equal("10001", cost.ReasonCodeSnapshot);
        Assert.Equal("Parking", cost.ReasonTextSnapshot);
    }
    
    [Fact]
    public async Task BuildAsync_WhenExistingAdditionalCostChangesToInactiveReason_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var existingReasonId = Guid.NewGuid();

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, CostReason>
            {
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Std, isActive: false)
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        var existingRequisition = CreateExistingRequisition(additionalCostId: existingRowId, reasonId: existingReasonId);
        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto(id: existingRowId)]);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, existingRequisition, CancellationToken.None));

        // Assert
        Assert.Equal(
            "Additional cost reason '10001 - Parking' is inactive and cannot be selected.",
            exception.Message);
    }

    [Fact]
    public async Task BuildAsync_WhenTransferShopIsMissing_ThrowsNotFoundException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, ShopRequisitionSnapshotDto>
            {
                [ToShopId] = RequisitionBuilderTestData.CreateShopSnapshot(ToShopId, "S003", "To Shop")
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(transfers: [CreateTransferDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenNewTransferUsesInactiveShop_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, ShopRequisitionSnapshotDto>
            {
                [FromShopId] = RequisitionBuilderTestData.CreateShopSnapshot(FromShopId, "S002", "From Shop", isActive: false),
                [ToShopId] = RequisitionBuilderTestData.CreateShopSnapshot(ToShopId, "S003", "To Shop")
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(transfers: [CreateTransferDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenExistingTransferUsesInactiveShop_AllowsSave()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, ShopRequisitionSnapshotDto>
            {
                [FromShopId] = RequisitionBuilderTestData.CreateShopSnapshot(FromShopId, "S002", "From Shop", isActive: false),
                [ToShopId] = RequisitionBuilderTestData.CreateShopSnapshot(ToShopId, "S003", "To Shop")
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        var existingRequisition = CreateExistingRequisition(transferId: existingRowId, fromShopId: FromShopId, toShopId: ToShopId);
        var dto = CreateDto(transfers: [CreateTransferDto(id: existingRowId)]);

        // Act
        var result = await builder.BuildAsync(dto, existingRequisition, CancellationToken.None);

        // Assert
        var transfer = Assert.Single(result.UpdateModel.Transfers);

        Assert.Equal(FromShopId, transfer.FromShop.Id);
        Assert.Equal("S002", transfer.FromShop.Code);
        Assert.Equal("From Shop", transfer.FromShop.Name);

        Assert.Equal(ToShopId, transfer.ToShop.Id);
        Assert.Equal("S003", transfer.ToShop.Code);
        Assert.Equal("To Shop", transfer.ToShop.Name);
    }
    
    [Fact]
    public async Task BuildAsync_WhenExistingTransferChangesToInactiveFromShop_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var existingFromShopId = Guid.NewGuid();

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, ShopRequisitionSnapshotDto>
            {
                [FromShopId] = RequisitionBuilderTestData.CreateShopSnapshot(FromShopId, "S002", "From Shop", isActive: false),
                [ToShopId] = RequisitionBuilderTestData.CreateShopSnapshot(ToShopId, "S003", "To Shop")
            });

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var existingRowId = Guid.NewGuid();
        var existingRequisition = CreateExistingRequisition(transferId: existingRowId, fromShopId: existingFromShopId, toShopId: ToShopId);
        var dto = CreateDto(transfers: [CreateTransferDto(id: existingRowId)]);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            builder.BuildAsync(dto, existingRequisition, CancellationToken.None));

        // Assert
        Assert.Equal("From shop 'S002 - From Shop' is inactive and cannot be selected.", exception.Message);
    }

    [Fact]
    public async Task BuildAsync_WhenVanPackRateExists_MapsRatePerVanPack()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdVanPackRateAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(4.25m);

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(collectionVanPacks: [CreateCollectionVanPackDto()]);

        // Act
        var result = await builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None);

        // Assert
        var vanPack = Assert.Single(result.UpdateModel.CollectionVanPacks);

        Assert.Equal(new DateOnly(2026, 6, 16), vanPack.DeliveryDate);
        Assert.Equal("AB", vanPack.PostCodeZone);
        Assert.Equal(10, vanPack.VanPacksOut);
        Assert.Equal(4, vanPack.FilledBags);
        Assert.Equal(4.25m, vanPack.RatePerVanPack);
    }

    [Fact]
    public async Task BuildAsync_WhenVanPackRateIsMissing_ThrowsValidationException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadStdVanPackRateAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((decimal?)null);

        var builder = new StdRequisitionSaveDataBuilder(loader.Object);
        var dto = CreateDto(collectionVanPacks: [CreateCollectionVanPackDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<ValidationException>(() =>
            builder.BuildAsync(dto, It.IsAny<StdRequisition?>(), CancellationToken.None));
    }

    private static Mock<IRequisitionLookupLoader> CreateLoaderMock()
    {
        var loader = new Mock<IRequisitionLookupLoader>();

        loader
            .Setup(x => x.LoadDriverLookupAsync(
                DriverId,
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(RequisitionBuilderTestData.CreateDriverLookup(DriverId));

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotAsync(
                ShopId,
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(RequisitionBuilderTestData.CreateShopSnapshot(
                ShopId,
                "S001",
                "Main Shop"));

        loader
            .Setup(x => x.LoadStdCollectionTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdCollectionType>());

        loader
            .Setup(x => x.LoadStdLocationMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, StdLocation>());

        loader
            .Setup(x => x.LoadCostReasonMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, CostReason>());

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, ShopRequisitionSnapshotDto>());

        loader
            .Setup(x => x.LoadStdVanPackRateAsync(
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((decimal?)null);

        return loader;
    }

    private static SaveStdRequisitionDto CreateDto(
        IReadOnlyCollection<SaveStdCollectionChargeBanksAndBinsDto>? collectionCharges = null,
        IReadOnlyCollection<SaveStdCollectionVanPackDto>? collectionVanPacks = null,
        IReadOnlyCollection<SaveStdTransferDto>? transfers = null,
        IReadOnlyCollection<SaveStdAdditionalCostDto>? additionalCosts = null)
    {
        return new SaveStdRequisitionDto
        {
            RequisitionDate = new DateOnly(2026, 6, 13),
            VanDriverId = DriverId,
            VanDriverName = "Standard Driver",
            ShopId = ShopId,
            CollectionChargesBanksAndBins = collectionCharges ?? Array.Empty<SaveStdCollectionChargeBanksAndBinsDto>(),
            CollectionVanPacks = collectionVanPacks ?? Array.Empty<SaveStdCollectionVanPackDto>(),
            Pickups = Array.Empty<SaveStdPickupDto>(),
            Transfers = transfers ?? Array.Empty<SaveStdTransferDto>(),
            AdditionalCosts = additionalCosts ?? Array.Empty<SaveStdAdditionalCostDto>()
        };
    }

    private static SaveStdCollectionChargeBanksAndBinsDto CreateCollectionChargeDto(Guid? id = null)
    {
        return new SaveStdCollectionChargeBanksAndBinsDto
        {
            Id = id,
            Date = new DateOnly(2026, 6, 14),
            CollectionTypeId = CollectionTypeId,
            LocationId = LocationId,
            NumberOfBags = 2,
            ChargeType = StdChargeType.Mileage,
            Miles = 10,
            RatePerMile = 1.25m
        };
    }

    private static SaveStdCollectionVanPackDto CreateCollectionVanPackDto(Guid? id = null)
    {
        return new SaveStdCollectionVanPackDto
        {
            Id = id,
            DeliveryDate = new DateOnly(2026, 6, 16),
            PostCodeZone = "AB",
            VanPacksOut = 10,
            FilledBags = 4
        };
    }

    private static SaveStdTransferDto CreateTransferDto(Guid? id = null)
    {
        return new SaveStdTransferDto
        {
            Id = id,
            Date = new DateOnly(2026, 6, 14),
            ShopIdFrom = FromShopId,
            ShopIdTo = ToShopId,
            NumberOfBags = 2,
            NumberOfBoxes = 1,
            ChargeType = StdChargeType.Mileage,
            Miles = 12,
            RatePerMile = 1.50m
        };
    }

    private static SaveStdAdditionalCostDto CreateAdditionalCostDto(Guid? id = null)
    {
        return new SaveStdAdditionalCostDto
        {
            Id = id,
            Date = new DateOnly(2026, 6, 14),
            ReasonId = ReasonId,
            NumberOfBags = 2,
            ChargeType = StdChargeType.FlatCharge,
            FlatCharge = 5.75m
        };
    }

    private static StdRequisition CreateExistingRequisition(
        Guid? collectionChargeId = null,
        Guid? collectionTypeId = null,
        Guid? locationId = null,
        Guid? transferId = null,
        Guid? fromShopId = null,
        Guid? toShopId = null,
        Guid? additionalCostId = null,
        Guid? reasonId = null)
    {
        var requisition = StdRequisition.Create(
            "S000000001",
            new StdRequisitionUpdateModel(
                CreateDetails(),
                Pickups: [],
                Transfers: transferId.HasValue
                    ?
                    [
                        new StdTransferUpdateModel(
                            Id: null,
                            Date: new DateOnly(2026, 6, 14),
                            FromShop: new ShopSnapshot(
                                fromShopId ?? FromShopId,
                                "S002",
                                "From Shop"),
                            ToShop: new ShopSnapshot(
                                toShopId ?? ToShopId,
                                "S003",
                                "To Shop"),
                            NumberOfBags: 2,
                            NumberOfBoxes: 1,
                            ChargeType: StdChargeType.Mileage,
                            NumberOfMiles: 12,
                            RatePerMile: 1.50m,
                            FlatCharge: null)
                    ]
                    : [],
                CollectionChargesBanksAndBins: collectionChargeId.HasValue
                    ?
                    [
                        new StdCollectionChargeBanksAndBinsUpdateModel(
                            Id: null,
                            Date: new DateOnly(2026, 6, 14),
                            CollectionTypeId: collectionTypeId ?? CollectionTypeId,
                            CollectionTypeName: "Banks & Bins",
                            CollectionTypeCode: "2389",
                            LocationId: locationId ?? LocationId,
                            LocationShopId: ShopId,
                            LocationCollectionTypeId: collectionTypeId ?? CollectionTypeId,
                            LocationName: "Test Location",
                            LocationPostCode: "AB1 2CD",
                            NumberOfBags: 2,
                            ChargeType: StdChargeType.Mileage,
                            Miles: 10,
                            RatePerMile: 1.25m,
                            FlatCharge: null)
                    ]
                    : [],
                CollectionVanPacks: [],
                AdditionalCosts: additionalCostId.HasValue
                    ?
                    [
                        new StdAdditionalCostUpdateModel(
                            Id: null,
                            Date: new DateOnly(2026, 6, 14),
                            ReasonId: reasonId ?? ReasonId,
                            ReasonCodeSnapshot: "10001",
                            ReasonTextSnapshot: "Parking",
                            NumberOfBags: 2,
                            ChargeType: StdChargeType.FlatCharge,
                            Miles: null,
                            RatePerMile: null,
                            FlatCharge: 5.75m)
                    ]
                    : []));

        if (collectionChargeId.HasValue)
        {
            SetEntityId(Assert.Single(requisition.CollectionChargesBanksAndBins), collectionChargeId.Value);
        }

        if (transferId.HasValue)
        {
            SetEntityId(Assert.Single(requisition.Transfers), transferId.Value);
        }

        if (additionalCostId.HasValue)
        {
            SetEntityId(Assert.Single(requisition.AdditionalCosts), additionalCostId.Value);
        }

        return requisition;
    }

    private static StdRequisitionDetails CreateDetails()
    {
        return new StdRequisitionDetails(
            new DateOnly(2026, 6, 13),
            new VanDriverSnapshot(DriverId, "VD001", "Standard Driver", "Test Driver Trading", HasVat: true),
            new ShopSnapshot(ShopId, "S001", "Main Shop"));
    }

    private static void SetEntityId<TEntity>(TEntity entity, Guid id)
    {
        var type = typeof(TEntity);

        while (type is not null)
        {
            var property = type.GetProperty("Id", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);

            if (property is not null)
            {
                property.SetValue(entity, id);
                return;
            }

            type = type.BaseType;
        }

        throw new InvalidOperationException($"Could not find Id property on entity type '{typeof(TEntity).Name}'.");
    }
}