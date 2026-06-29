using Moq;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeRequisitions.Builders;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.UnitTests.TestData;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.FeRequisitions.Builders;

public sealed class FeRequisitionSaveDataBuilderTests
{
    private static readonly Guid DriverId = Guid.NewGuid();
    private static readonly Guid ShopId = Guid.NewGuid();
    private static readonly Guid TaskTypeId = Guid.NewGuid();
    private static readonly Guid ReasonId = Guid.NewGuid();
    private static readonly Guid FromShopId = Guid.NewGuid();
    private static readonly Guid ToShopId = Guid.NewGuid();

    [Fact]
    public async Task BuildAsync_WhenLookupsExist_MapsDetailsAndDriverSummary()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto();

        // Act
        var result = await builder.BuildAsync(dto, CancellationToken.None);

        // Assert
        Assert.Equal(DriverId, result.DriverSummary.Id);
        Assert.True(result.IsShopActive);

        Assert.Equal(dto.RequisitionDate, result.UpdateModel.Details.RequisitionDate);

        Assert.Equal(DriverId, result.UpdateModel.Details.Driver.Id);
        Assert.Equal("VD001", result.UpdateModel.Details.Driver.Code);
        Assert.Equal("Frontend Driver", result.UpdateModel.Details.Driver.Name);
        Assert.Equal("Test Driver Trading", result.UpdateModel.Details.Driver.TradersName);
        Assert.True(result.UpdateModel.Details.Driver.HasVat);

        Assert.Equal(ShopId, result.UpdateModel.Details.Shop.Id);
        Assert.Equal("S001", result.UpdateModel.Details.Shop.Code);
        Assert.Equal("Main Shop", result.UpdateModel.Details.Shop.Name);
    }

    [Fact]
    public async Task BuildAsync_WhenTaskTypeExists_MapsGeneralTaskSnapshot()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadFeTaskTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, FeTaskType>
            {
                [TaskTypeId] = RequisitionBuilderTestData.CreateFeTaskType(TaskTypeId)
            });

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(generalTasks: [CreateGeneralTaskDto()]);

        // Act
        var result = await builder.BuildAsync(dto, CancellationToken.None);

        // Assert
        var task = Assert.Single(result.UpdateModel.GeneralTasks);

        Assert.Equal(TaskTypeId, task.FeTaskTypeId);
        Assert.Equal("23707", task.TaskTypeCode);
        Assert.Equal("General Task", task.TaskTypeName);
    }

    [Fact]
    public async Task BuildAsync_WhenTaskTypeIsMissing_ThrowsNotFoundException()
    {
        // Arrange
        var loader = CreateLoaderMock();
        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(generalTasks: [CreateGeneralTaskDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() => builder.BuildAsync(dto, CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenNewGeneralTaskUsesInactiveTaskType_ThrowsBadRequestException()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadFeTaskTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, FeTaskType>
            {
                [TaskTypeId] = RequisitionBuilderTestData.CreateFeTaskType(TaskTypeId, isActive: false)
            });

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(generalTasks: [CreateGeneralTaskDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() => builder.BuildAsync(dto, CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenExistingGeneralTaskUsesInactiveTaskType_AllowsSave()
    {
        // Arrange
        var loader = CreateLoaderMock();

        loader
            .Setup(x => x.LoadFeTaskTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, FeTaskType>
            {
                [TaskTypeId] = RequisitionBuilderTestData.CreateFeTaskType(TaskTypeId, isActive: false)
            });

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(generalTasks: [CreateGeneralTaskDto(id: Guid.NewGuid())]);

        // Act
        var result = await builder.BuildAsync(dto, CancellationToken.None);

        // Assert
        var task = Assert.Single(result.UpdateModel.GeneralTasks);

        Assert.Equal(TaskTypeId, task.FeTaskTypeId);
        Assert.Equal("23707", task.TaskTypeCode);
        Assert.Equal("General Task", task.TaskTypeName);
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
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Fe)
            });

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto()]);

        // Act
        var result = await builder.BuildAsync(dto, CancellationToken.None);

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
        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() => builder.BuildAsync(dto, CancellationToken.None));
    }

    [Fact]
    public async Task BuildAsync_WhenAdditionalCostReasonIsStdOnly_ThrowsBadRequestException()
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

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() => builder.BuildAsync(dto, CancellationToken.None));
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
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Fe, isActive: false)
            });

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() => builder.BuildAsync(dto, CancellationToken.None));
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
                [ReasonId] = RequisitionBuilderTestData.CreateCostReason(ReasonId, CostReasonScope.Fe, isActive: false)
            });

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(additionalCosts: [CreateAdditionalCostDto(id: Guid.NewGuid())]);

        // Act
        var result = await builder.BuildAsync(dto, CancellationToken.None);

        // Assert
        var cost = Assert.Single(result.UpdateModel.AdditionalCosts);

        Assert.Equal(ReasonId, cost.ReasonId);
        Assert.Equal("10001", cost.ReasonCodeSnapshot);
        Assert.Equal("Parking", cost.ReasonTextSnapshot);
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

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(transfers: [CreateTransferDto()]);

        // Act / Assert
        await Assert.ThrowsAsync<NotFoundException>(() => builder.BuildAsync(dto, CancellationToken.None));
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

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(transfers: [CreateTransferDto(id: null)]);

        // Act / Assert
        await Assert.ThrowsAsync<BadRequestException>(() => builder.BuildAsync(dto, CancellationToken.None));
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

        var builder = new FeRequisitionSaveDataBuilder(loader.Object);

        var dto = CreateDto(transfers: [CreateTransferDto(id: Guid.NewGuid())]);

        // Act
        var result = await builder.BuildAsync(dto, CancellationToken.None);

        // Assert
        var transfer = Assert.Single(result.UpdateModel.Transfers);

        Assert.Equal(FromShopId, transfer.FromShop.Id);
        Assert.Equal("S002", transfer.FromShop.Code);
        Assert.Equal("From Shop", transfer.FromShop.Name);

        Assert.Equal(ToShopId, transfer.ToShop.Id);
        Assert.Equal("S003", transfer.ToShop.Code);
        Assert.Equal("To Shop", transfer.ToShop.Name);
    }

    private static Mock<IRequisitionLookupLoader> CreateLoaderMock()
    {
        var loader = new Mock<IRequisitionLookupLoader>();

        loader
            .Setup(x => x.LoadDriverLookupAsync(
                DriverId, It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(RequisitionBuilderTestData.CreateDriverLookup(DriverId));

        loader
            .Setup(x => x.LoadShopRequisitionSnapshotAsync(
                ShopId,
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(RequisitionBuilderTestData.CreateShopSnapshot(ShopId, "S001", "Main Shop"));

        loader
            .Setup(x => x.LoadFeTaskTypeMapAsync(
                It.IsAny<IEnumerable<Guid>>(),
                It.IsAny<CancellationToken>(),
                true))
            .ReturnsAsync(new Dictionary<Guid, FeTaskType>());

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

        return loader;
    }

    private static SaveFeRequisitionDto CreateDto(
        IReadOnlyCollection<SaveFeGeneralTaskDto>? generalTasks = null,
        IReadOnlyCollection<SaveFeTransferDto>? transfers = null,
        IReadOnlyCollection<SaveFeAdditionalCostDto>? additionalCosts = null)
    {
        return new SaveFeRequisitionDto
        {
            RequisitionDate = new DateOnly(2026, 6, 13),
            VanDriverId = DriverId,
            VanDriverName = "Frontend Driver",
            ShopId = ShopId,
            FeGeneralTasks = generalTasks ?? Array.Empty<SaveFeGeneralTaskDto>(),
            FeMileages = Array.Empty<SaveFeMileageDto>(),
            FeTransfers = transfers ?? Array.Empty<SaveFeTransferDto>(),
            FeAdditionalCosts = additionalCosts ?? Array.Empty<SaveFeAdditionalCostDto>()
        };
    }

    private static SaveFeGeneralTaskDto CreateGeneralTaskDto(Guid? id = null)
    {
        return new SaveFeGeneralTaskDto
        {
            Id = id,
            FeTaskTypeId = TaskTypeId,
            WeekEndingDate = new DateOnly(2026, 6, 14),
            Week = RequisitionBuilderTestData.CreateWeek(),
            RatePerJob = 1.25m
        };
    }

    private static SaveFeTransferDto CreateTransferDto(Guid? id = null)
    {
        return new SaveFeTransferDto
        {
            Id = id,
            WeekEndingDate = new DateOnly(2026, 6, 14),
            ShopIdFrom = FromShopId,
            ShopIdTo = ToShopId,
            Week = RequisitionBuilderTestData.CreateWeek(),
            RatePerJob = 2.50m
        };
    }

    private static SaveFeAdditionalCostDto CreateAdditionalCostDto(Guid? id = null)
    {
        return new SaveFeAdditionalCostDto
        {
            Id = id,
            WeekEndingDate = new DateOnly(2026, 6, 14),
            ReasonId = ReasonId,
            ChargingOption = ChargingOption.Job,
            TotalNumber = 2,
            RatePerJob = 3.50m
        };
    }
}