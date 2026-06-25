using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.ValueObjects;

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
        var transfer = FeTransfer.Create(fromShop, toShop, WeekEndingDate, week, ratePerJob: 2m);

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
        var fromShop = CreateShopSnapshot();
        var toShop = CreateShopSnapshot();
        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var transfer = FeTransfer.Create(fromShop, toShop, WeekEndingDate, week, ratePerJob: null);

        // Assert
        Assert.Equal(28, transfer.TotalNumber);
        Assert.Null(transfer.RatePerJob);
        Assert.Equal(0m, transfer.TotalValue);
    }

    [Fact]
    public void Create_WhenWeekHasNullValues_TreatsNullValuesAsZero()
    {
        // Arrange
        var fromShop = CreateShopSnapshot();
        var toShop = CreateShopSnapshot();

        var week = CreateWeek(null, 2, null,4, null, 6,  null);

        // Act
        var transfer = FeTransfer.Create(fromShop, toShop, WeekEndingDate, week, ratePerJob: 3m);

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
        transfer.Update(
            newFromShop,
            newToShop,
            newWeekEndingDate,
            newWeek,
            ratePerJob: 0.25m);

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
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeTransfer.Create(
                null!,
                CreateShopSnapshot(),
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));

        // Assert
        Assert.Equal("fromShop", exception.ParamName);
    }

    [Fact]
    public void Create_WhenToShopIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeTransfer.Create(
                CreateShopSnapshot(),
                null!,
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));

        // Assert
        Assert.Equal("toShop", exception.ParamName);
    }

    [Fact]
    public void Create_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeTransfer.Create(
                CreateShopSnapshot(),
                CreateShopSnapshot(),
                WeekEndingDate,
                null!,
                ratePerJob: 1m));

        // Assert
        Assert.Equal("week", exception.ParamName);
    }

    [Fact]
    public void Update_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var transfer = CreateTransfer();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            transfer.Update(
                CreateShopSnapshot(),
                CreateShopSnapshot(),
                new DateOnly(2026, 6, 20),
                null!,
                ratePerJob: 1m));

        // Assert
        Assert.Equal("week", exception.ParamName);
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
            FeTransfer.Create(
                fromShop,
                toShop,
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));
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
            transfer.Update(
                fromShop,
                toShop,
                new DateOnly(2026, 6, 20),
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));
    }

    [Fact]
    public void Create_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(
                CreateShopSnapshot(),
                CreateShopSnapshot(),
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: -0.01m));
    }

    [Fact]
    public void Update_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var transfer = CreateTransfer();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            transfer.Update(
                CreateShopSnapshot(),
                CreateShopSnapshot(),
                new DateOnly(2026, 6, 20),
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: -0.01m));
    }
    
    [Theory]
    [InlineData(0)]
    [InlineData(0.001)]
    public void Create_WhenRateIsBelowMinimum_ThrowsInvalidOperationException(decimal ratePerJob)
    {
        Assert.Throws<InvalidOperationException>(() =>
            FeTransfer.Create(
                CreateShopSnapshot(),
                CreateShopSnapshot(),
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob));
    }

    private static FeTransfer CreateTransfer()
    {
        return FeTransfer.Create(
            CreateShopSnapshot(code: "S001", name: "From Shop"),
            CreateShopSnapshot(code: "S002", name: "To Shop"),
            WeekEndingDate,
            CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob: 1m);
    }

    private static ShopSnapshot CreateShopSnapshot(Guid? id = null, string code = "S001", string name = "Test Shop")
    {
        return new ShopSnapshot(id ?? Guid.NewGuid(), code, name);
    }

    private static WeeklyQuantities CreateWeek(
        int? sunday = 0,
        int? monday = 0,
        int? tuesday = 0,
        int? wednesday = 0,
        int? thursday = 0,
        int? friday = 0,
        int? saturday = 0)
    {
        return new WeeklyQuantities(
            sunday,
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday);
    }
}