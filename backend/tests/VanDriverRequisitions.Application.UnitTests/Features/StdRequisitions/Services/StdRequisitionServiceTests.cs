using Microsoft.EntityFrameworkCore;
using Moq;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.StdRequisitions.Builders;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Models;
using VanDriverRequisitions.Application.Features.StdRequisitions.Services;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.Features.SubmitWindows.Services;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.Features.StdRequisitions.Services;

public sealed class StdRequisitionServiceTests
{
    private static readonly Guid DriverId = Guid.NewGuid();
    private static readonly Guid ShopId = Guid.NewGuid();
    private static readonly DateTime UtcNow = new(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task CreateAsync_WhenRequestIsValid_CreatesRequisitionAndSaves()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData();

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        StdRequisition? addedRequisition = null;

        fixture.StdRequisitions
            .Setup(x => x.Add(It.IsAny<StdRequisition>()))
            .Callback<StdRequisition>(x => addedRequisition = x);

        // Act
        var result = await fixture.Service.CreateAsync(dto, CancellationToken.None);

        // Assert
        Assert.NotNull(addedRequisition);
        Assert.Equal("S000000001", addedRequisition.RequisitionNumber);
        Assert.Equal(RequisitionStatus.Draft, addedRequisition.Status);

        Assert.Equal("S000000001", result.RequisitionNumber);
        Assert.Equal("Draft", result.Status);

        fixture.Validator.Verify(
            x => x.ValidateAsync(dto, It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.NumberGenerator.Verify(
            x => x.GenerateAsync(It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.SaveDataBuilder.Verify(
            x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.LimitValidator.Verify(
            x => x.ValidateAsync(
                It.Is<StdRequisition>(r => r.RequisitionNumber == "S000000001"),
                It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WhenDtoValidationThrows_DoesNotBuildOrSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();

        fixture.Validator
            .Setup(x => x.ValidateAsync(dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("DTO validation failure."));

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.Service.CreateAsync(dto, CancellationToken.None));

        // Assert
        Assert.Equal("DTO validation failure.", exception.Message);

        fixture.SaveDataBuilder.Verify(
            x => x.BuildAsync(It.IsAny<SaveStdRequisitionDto>(), It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.NumberGenerator.Verify(
            x => x.GenerateAsync(It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateAsync_WhenDriverIsInactive_ThrowsBadRequestExceptionAndDoesNotSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData(isDriverActive: false);

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.CreateAsync(dto, CancellationToken.None));

        // Assert
        Assert.Equal(
            "Van driver 'VD001 - Test Driver Trading' is inactive and cannot be used for a new requisition.",
            exception.Message);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.LimitValidator.Verify(
            x => x.ValidateAsync(It.IsAny<StdRequisition>(), It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateAsync_WhenShopIsInactive_ThrowsBadRequestExceptionAndDoesNotSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData(isShopActive: false);

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.CreateAsync(dto, CancellationToken.None));

        // Assert
        Assert.Equal(
            "Shop 'S001 - Test Shop' is inactive and cannot be used for a new requisition.",
            exception.Message);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.LimitValidator.Verify(
            x => x.ValidateAsync(It.IsAny<StdRequisition>(), It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateAsync_WhenLimitValidatorThrows_DoesNotSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData();

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        fixture.LimitValidator
            .Setup(x => x.ValidateAsync(
                It.IsAny<StdRequisition>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Limit failure."));

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.Service.CreateAsync(dto, CancellationToken.None));

        // Assert
        Assert.Equal("Limit failure.", exception.Message);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SubmitAsync_WhenNewRequestIsValid_SubmitsNewRequisitionAndSaves()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData();

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        RequisitionStatus? statusAtLimitValidation = null;

        fixture.LimitValidator
            .Setup(x => x.ValidateAsync(
                It.IsAny<StdRequisition>(),
                It.IsAny<CancellationToken>()))
            .Callback<StdRequisition, CancellationToken>((requisition, _) =>
            {
                statusAtLimitValidation = requisition.Status;
            })
            .Returns(Task.CompletedTask);

        StdRequisition? addedRequisition = null;

        fixture.StdRequisitions
            .Setup(x => x.Add(It.IsAny<StdRequisition>()))
            .Callback<StdRequisition>(x => addedRequisition = x);

        // Act
        var result = await fixture.Service.SubmitAsync(null, dto, CancellationToken.None);

        // Assert
        Assert.NotNull(addedRequisition);
        Assert.Equal("S000000001", addedRequisition.RequisitionNumber);
        Assert.Equal(RequisitionStatus.Submitted, addedRequisition.Status);
        Assert.Equal(UtcNow, addedRequisition.SubmittedAtUtc);
        Assert.Single(addedRequisition.Submissions);

        Assert.Equal("S000000001", result.RequisitionNumber);
        Assert.Equal("Submitted", result.Status);

        Assert.Equal(RequisitionStatus.Draft, statusAtLimitValidation);

        fixture.CurrentUser.Verify(
            x => x.RequireUser(),
            Times.Once);

        fixture.Validator.Verify(
            x => x.ValidateAsync(dto, It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.SubmitWindowGuard.Verify(
            x => x.EnsureSubmissionWindowIsOpenAsync(It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.NumberGenerator.Verify(
            x => x.GenerateAsync(It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.LimitValidator.Verify(
            x => x.ValidateAsync(
                It.IsAny<StdRequisition>(),
                It.IsAny<CancellationToken>()),
            Times.Once);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task SubmitAsync_WhenDtoValidationThrows_DoesNotCheckSubmitWindowOrSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();

        fixture.Validator
            .Setup(x => x.ValidateAsync(dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("DTO validation failure."));

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.Service.SubmitAsync(null, dto, CancellationToken.None));

        // Assert
        Assert.Equal("DTO validation failure.", exception.Message);

        fixture.SubmitWindowGuard.Verify(
            x => x.EnsureSubmissionWindowIsOpenAsync(It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.SaveDataBuilder.Verify(
            x => x.BuildAsync(It.IsAny<SaveStdRequisitionDto>(), It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SubmitAsync_WhenSubmitWindowGuardThrows_DoesNotBuildOrSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();

        fixture.SubmitWindowGuard
            .Setup(x => x.EnsureSubmissionWindowIsOpenAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new BadRequestException("Submission window is closed."));

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.SubmitAsync(null, dto, CancellationToken.None));

        // Assert
        Assert.Equal("Submission window is closed.", exception.Message);

        fixture.SaveDataBuilder.Verify(
            x => x.BuildAsync(It.IsAny<SaveStdRequisitionDto>(), It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SubmitAsync_WhenNewRequestHasInactiveDriver_ThrowsBadRequestExceptionAndDoesNotSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData(isDriverActive: false);

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.SubmitAsync(null, dto, CancellationToken.None));

        // Assert
        Assert.Equal(
            "Van driver 'VD001 - Test Driver Trading' is inactive and cannot be used for a new requisition.",
            exception.Message);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.LimitValidator.Verify(
            x => x.ValidateAsync(It.IsAny<StdRequisition>(), It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SubmitAsync_WhenNewRequestHasInactiveShop_ThrowsBadRequestExceptionAndDoesNotSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData(isShopActive: false);

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() =>
            fixture.Service.SubmitAsync(null, dto, CancellationToken.None));

        // Assert
        Assert.Equal(
            "Shop 'S001 - Test Shop' is inactive and cannot be used for a new requisition.",
            exception.Message);

        fixture.StdRequisitions.Verify(
            x => x.Add(It.IsAny<StdRequisition>()),
            Times.Never);

        fixture.LimitValidator.Verify(
            x => x.ValidateAsync(It.IsAny<StdRequisition>(), It.IsAny<CancellationToken>()),
            Times.Never);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task SubmitAsync_WhenLimitValidatorThrows_DoesNotSave()
    {
        // Arrange
        var fixture = CreateFixture();

        var dto = CreateSaveDto();
        var saveData = CreateSaveData();

        fixture.SaveDataBuilder
            .Setup(x => x.BuildAsync(dto, It.IsAny<StdRequisition?>(),It.IsAny<CancellationToken>()))
            .ReturnsAsync(saveData);

        fixture.LimitValidator
            .Setup(x => x.ValidateAsync(
                It.IsAny<StdRequisition>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Limit failure."));

        // Act
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            fixture.Service.SubmitAsync(null, dto, CancellationToken.None));

        // Assert
        Assert.Equal("Limit failure.", exception.Message);

        fixture.Context.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static TestFixture CreateFixture()
    {
        var context = new Mock<IApplicationDbContext>();
        var currentUser = new Mock<ICurrentUserService>();
        var validator = new Mock<IValidatorService>();
        var poNumberGenerator = new Mock<IPoNumberGenerator>();
        var limitValidator = new Mock<IStdRequisitionLimitValidator>();
        var numberGenerator = new Mock<IStdRequisitionNumberGenerator>();
        var saveDataBuilder = new Mock<IStdRequisitionSaveDataBuilder>();
        var lookupLoader = new Mock<IRequisitionLookupLoader>();
        var submitWindowGuard = new Mock<ISubmitWindowSubmissionGuard>();
        var stdRequisitions = new Mock<DbSet<StdRequisition>>();

        context
            .Setup(x => x.StdRequisitions)
            .Returns(stdRequisitions.Object);

        context
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        numberGenerator
            .Setup(x => x.GenerateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("S000000001");
        
        currentUser
            .Setup(x => x.RequireUser())
            .Returns(new LoggedInUser(Guid.NewGuid(), "Test User"));

        var service = new StdRequisitionService(
            context.Object,
            currentUser.Object,
            validator.Object,
            poNumberGenerator.Object,
            numberGenerator.Object,
            saveDataBuilder.Object,
            limitValidator.Object,
            new FixedTimeProvider(UtcNow),
            submitWindowGuard.Object,
            lookupLoader.Object);

        return new TestFixture(
            service,
            context,
            currentUser,
            validator,
            limitValidator,
            numberGenerator,
            saveDataBuilder,
            submitWindowGuard,
            stdRequisitions);
    }

    private static SaveStdRequisitionDto CreateSaveDto()
    {
        return new SaveStdRequisitionDto
        {
            RequisitionDate = new DateOnly(2026, 6, 13),
            VanDriverId = DriverId,
            VanDriverName = "Test Driver",
            ShopId = ShopId,
            Pickups = [],
            Transfers = [],
            CollectionChargesBanksAndBins = [],
            CollectionVanPacks = [],
            AdditionalCosts = [],
        };
    }

    private static StdRequisitionSaveData CreateSaveData(
        bool isDriverActive = true,
        bool isShopActive = true)
    {
        var driver = new VanDriverLookupDto
        {
            Id = DriverId,
            Code = "VD001",
            TradersName = "Test Driver Trading",
            Address1 = "1 Test Street",
            Postcode = "AB1 2CD",
            HasVat = true,
            IsActive = isDriverActive,
        };

        var details = new StdRequisitionDetails(
            new DateOnly(2026, 6, 13),
            new VanDriverSnapshot(
                DriverId,
                "VD001",
                "Test Driver",
                "Test Driver Trading",
                HasVat: true),
            new ShopSnapshot(
                ShopId,
                "S001",
                "Test Shop"));

        var updateModel = new StdRequisitionUpdateModel(
            details,
            Pickups: [],
            Transfers: [],
            CollectionChargesBanksAndBins: [],
            CollectionVanPacks:
            [
                CreateCollectionVanPackModel()
            ],
            AdditionalCosts: []);

        return new StdRequisitionSaveData(
            driver,
            updateModel,
            isShopActive);
    }
    
    private static StdCollectionVanPackUpdateModel CreateCollectionVanPackModel()
    {
        return new StdCollectionVanPackUpdateModel(
            Id: null,
            DeliveryDate: new DateOnly(2026, 6, 13),
            PostCodeZone: "AB",
            VanPacksOut: 1,
            FilledBags: 1,
            RatePerVanPack: 10m);
    }

    private sealed record TestFixture(
        StdRequisitionService Service,
        Mock<IApplicationDbContext> Context,
        Mock<ICurrentUserService> CurrentUser,
        Mock<IValidatorService> Validator,
        Mock<IStdRequisitionLimitValidator> LimitValidator,
        Mock<IStdRequisitionNumberGenerator> NumberGenerator,
        Mock<IStdRequisitionSaveDataBuilder> SaveDataBuilder,
        Mock<ISubmitWindowSubmissionGuard> SubmitWindowGuard,
        Mock<DbSet<StdRequisition>> StdRequisitions);

    private sealed class FixedTimeProvider(DateTime utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow()
        {
            return new DateTimeOffset(utcNow);
        }
    }
}