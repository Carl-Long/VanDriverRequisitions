using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeTransferTests
{
    private static readonly DateOnly WeekEndingDate = new(2026, 6, 13);

    [Fact]
    public void Create_WhenValid_SnapshotsShopsAndCalculatesTotalNumberAndTotalValue()
    {
        // Arrange
        var fromShop = CreateShopSnapshot(code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(code: "S002", name: "To Shop");

        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var transfer = FeTransfer.Create(CreateModel(
            fromShop: fromShop,
            toShop: toShop,
            week: week,
            ratePerJob: 2m));

        // Assert
        Assert.Equal(WeekEndingDate, transfer.WeekEndingDate);

        Assert.Equal(fromShop.Id, transfer.ShopIdFrom);
        Assert.Equal("S001", transfer.ShopCodeFrom);
        Assert.Equal("From Shop", transfer.ShopNameFrom);

        Assert.Equal(toShop.Id, transfer.ShopIdTo);
        Assert.Equal("S002", transfer.ShopCodeTo);
        Assert.Equal("To Shop", transfer.ShopNameTo);

        Assert.Same(week, transfer.Week);
        Assert.Equal(28, transfer.TotalNumber);
        Assert.Equal(2m, transfer.RatePerJob);
        Assert.Equal(56.00m, transfer.TotalValue);
    }

    [Fact]
    public void Create_WhenRateIsNull_CalculatesTotalNumberAndZeroTotalValue()
    {
        // Arrange
        var fromShop = CreateShopSnapshot(code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(code: "S002", name: "To Shop");
        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var transfer = FeTransfer.Create(CreateModel(
            fromShop: fromShop,
            toShop: toShop,
            week: week,
            ratePerJob: null));

        // Assert
        Assert.Equal(28, transfer.TotalNumber);
        Assert.Null(transfer.RatePerJob);
        Assert.Equal(0m, transfer.TotalValue);
    }

    [Fact]
    public void Create_WhenWeekHasNullValues_TreatsNullValuesAsZero()
    {
        // Arrange
        var fromShop = CreateShopSnapshot(code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(code: "S002", name: "To Shop");

        var week = CreateWeek(null, 2, null, 4, null, 6, null);

        // Act
        var transfer = FeTransfer.Create(CreateModel(
            fromShop: fromShop,
            toShop: toShop,
            week: week,
            ratePerJob: 3m));

        // Assert
        Assert.Equal(12, transfer.TotalNumber);
        Assert.Equal(36.00m, transfer.TotalValue);
    }

    [Fact]
    public void Update_WhenValid_UpdatesShopsWeekRateAndRecalculatesTotals()
    {
        // Arrange
        var transfer = CreateTransfer();

        var newFromShop = CreateShopSnapshot(code: "S010", name: "New From Shop");
        var newToShop = CreateShopSnapshot(code: "S020", name: "New To Shop");

        var newWeekEndingDate = new DateOnly(2026, 6, 20);
        var newWeek = CreateWeek(10, 20, 30, 40, 50, 60, 70);

        // Act
        transfer.Update(CreateModel(
            fromShop: newFromShop,
            toShop: newToShop,
            weekEndingDate: newWeekEndingDate,
            week: newWeek,
            ratePerJob: 0.25m));

        // Assert
        Assert.Equal(newWeekEndingDate, transfer.WeekEndingDate);

        Assert.Equal(newFromShop.Id, transfer.ShopIdFrom);
        Assert.Equal("S010", transfer.ShopCodeFrom);
        Assert.Equal("New From Shop", transfer.ShopNameFrom);

        Assert.Equal(newToShop.Id, transfer.ShopIdTo);
        Assert.Equal("S020", transfer.ShopCodeTo);
        Assert.Equal("New To Shop", transfer.ShopNameTo);

        Assert.Same(newWeek, transfer.Week);
        Assert.Equal(280, transfer.TotalNumber);
        Assert.Equal(0.25m, transfer.RatePerJob);
        Assert.Equal(70.00m, transfer.TotalValue);
    }

    [Fact]
    public void Create_WhenFromShopIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var model = new FeTransferUpdateModel(
            Id: null,
            FromShop: null!,
            ToShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
            WeekEndingDate,
            CreateWeek(1, 1, 1, 1, 1, 1, 1),
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => FeTransfer.Create(model));
    }

    [Fact]
    public void Create_WhenToShopIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var model = new FeTransferUpdateModel(
            Id: null,
            FromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
            ToShop: null!,
            WeekEndingDate,
            CreateWeek(1, 1, 1, 1, 1, 1, 1),
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => FeTransfer.Create(model));
    }

    [Fact]
    public void Create_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var model = new FeTransferUpdateModel(
            Id: null,
            FromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
            ToShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
            WeekEndingDate,
            Week: null!,
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => FeTransfer.Create(model));
    }

    [Fact]
    public void Update_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var transfer = CreateTransfer();

        var model = new FeTransferUpdateModel(
            Id: null,
            FromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
            ToShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
            new DateOnly(2026, 6, 20),
            Week: null!,
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => transfer.Update(model));
    }

    [Fact]
    public void Create_WhenFromAndToShopAreSame_ThrowsInvalidOperationException()
    {
        // Arrange
        var sameShopId = Guid.NewGuid();

        var fromShop = CreateShopSnapshot(id: sameShopId, code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(id: sameShopId, code: "S002", name: "To Shop");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(CreateModel(
                fromShop: fromShop,
                toShop: toShop,
                ratePerJob: 1m)));
    }

    [Fact]
    public void Update_WhenFromAndToShopAreSame_ThrowsInvalidOperationException()
    {
        // Arrange
        var transfer = CreateTransfer();
        var sameShopId = Guid.NewGuid();

        var fromShop = CreateShopSnapshot(id: sameShopId, code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(id: sameShopId, code: "S002", name: "To Shop");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            transfer.Update(CreateModel(
                fromShop: fromShop,
                toShop: toShop,
                weekEndingDate: new DateOnly(2026, 6, 20),
                ratePerJob: 1m)));
    }

    [Fact]
    public void Create_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(CreateModel(
                fromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
                toShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
                ratePerJob: -0.01m)));
    }

    [Fact]
    public void Update_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var transfer = CreateTransfer();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            transfer.Update(CreateModel(
                fromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
                toShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
                weekEndingDate: new DateOnly(2026, 6, 20),
                ratePerJob: -0.01m)));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(0.001)]
    public void Create_WhenRateIsBelowMinimum_ThrowsInvalidOperationException(decimal ratePerJob)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(CreateModel(
                fromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
                toShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
                ratePerJob: ratePerJob)));
    }
    
    [Fact]
    public void Create_WhenWeekEndingDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = new FeTransferUpdateModel(
            Id: null,
            FromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
            ToShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
            WeekEndingDate: default(DateOnly),
            Week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => FeTransfer.Create(model));
    }
    
    [Fact]
    public void Create_WhenFromShopSnapshotIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var fromShop = CreateShopSnapshot(id: Guid.Empty, code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(code: "S002", name: "To Shop");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(CreateModel(
                fromShop: fromShop,
                toShop: toShop,
                ratePerJob: 1m)));
    }

    [Fact]
    public void Create_WhenToShopSnapshotIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var fromShop = CreateShopSnapshot(code: "S001", name: "From Shop");
        var toShop = CreateShopSnapshot(id: Guid.Empty, code: "S002", name: "To Shop");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(CreateModel(
                fromShop: fromShop,
                toShop: toShop,
                ratePerJob: 1m)));
    }

    private static FeTransfer CreateTransfer()
    {
        return FeTransfer.Create(CreateModel(
            fromShop: CreateShopSnapshot(code: "S001", name: "From Shop"),
            toShop: CreateShopSnapshot(code: "S002", name: "To Shop"),
            week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob: 1m));
    }

    private static FeTransferUpdateModel CreateModel(
        Guid? id = null,
        ShopSnapshot? fromShop = null,
        ShopSnapshot? toShop = null,
        DateOnly? weekEndingDate = null,
        WeeklyQuantities? week = null,
        decimal? ratePerJob = 1m)
    {
        return new FeTransferUpdateModel(
            id,
            fromShop ?? CreateShopSnapshot(code: "S001", name: "From Shop"),
            toShop ?? CreateShopSnapshot(code: "S002", name: "To Shop"),
            weekEndingDate ?? WeekEndingDate,
            week ?? CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob);
    }

    private static ShopSnapshot CreateShopSnapshot(Guid? id = null, string code = "S001", string name = "Test Shop")
    {
        return new ShopSnapshot(id ?? Guid.NewGuid(), code, name);
    }
}