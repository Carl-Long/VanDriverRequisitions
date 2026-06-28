using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdTransferTests
{
    [Fact]
    public void Create_WhenMileageBased_SnapshotsShopsAndCalculatesTotalValue()
    {
        // Arrange
        var fromShop = StdRequisitionTestData.CreateShopSnapshot(code: "S001", name: "From Shop");
        var toShop = StdRequisitionTestData.CreateShopSnapshot(code: "S002", name: "To Shop");

        var model = StdRequisitionTestData.CreateTransferMileageModel(
            fromShop: fromShop,
            toShop: toShop,
            numberOfMiles: 20,
            ratePerMile: 0.50m);

        // Act
        var transfer = StdTransfer.Create(model);

        // Assert
        Assert.Equal(model.Date, transfer.Date);

        Assert.Equal(fromShop.Id, transfer.ShopIdFrom);
        Assert.Equal("S001", transfer.ShopCodeFrom);
        Assert.Equal("From Shop", transfer.ShopNameFrom);

        Assert.Equal(toShop.Id, transfer.ShopIdTo);
        Assert.Equal("S002", transfer.ShopCodeTo);
        Assert.Equal("To Shop", transfer.ShopNameTo);

        Assert.Equal(StdChargeType.Mileage, transfer.ChargeType);
        Assert.Equal(20, transfer.Miles);
        Assert.Equal(0.50m, transfer.RatePerMile);
        Assert.Equal(10.00m, transfer.TotalValue);

        Assert.Null(transfer.FlatCharge);
    }

    [Fact]
    public void Create_WhenFlatChargeBased_CalculatesTotalValueAndClearsMileageFields()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateTransferFlatChargeModel(flatCharge: 12m);

        // Act
        var transfer = StdTransfer.Create(model);

        // Assert
        Assert.Equal(StdChargeType.FlatCharge, transfer.ChargeType);
        Assert.Equal(12m, transfer.FlatCharge);
        Assert.Equal(12m, transfer.TotalValue);

        Assert.Null(transfer.Miles);
        Assert.Null(transfer.RatePerMile);
    }

    [Fact]
    public void Create_WhenFromAndToShopAreSame_ThrowsInvalidOperationException()
    {
        // Arrange
        var sameShopId = Guid.NewGuid();

        var fromShop = StdRequisitionTestData.CreateShopSnapshot(id: sameShopId, code: "S001", name: "From Shop");
        var toShop = StdRequisitionTestData.CreateShopSnapshot(id: sameShopId, code: "S002", name: "To Shop");

        var model = StdRequisitionTestData.CreateTransferFlatChargeModel(fromShop: fromShop, toShop: toShop);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdTransfer.Create(model));
    }

    [Fact]
    public void Create_WhenFromShopIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateTransferFlatChargeModel() with
        {
            FromShop = null!
        };

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => StdTransfer.Create(model));

        // Assert
        Assert.Equal("From shop", exception.ParamName);
    }
    
    [Fact]
    public void Create_WhenToShopIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateTransferFlatChargeModel() with
        {
            ToShop = null!
        };

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => StdTransfer.Create(model));

        // Assert
        Assert.Equal("To shop", exception.ParamName);
    }

    [Theory]
    [InlineData(-1, null)]
    [InlineData(null, -1)]
    public void Create_WhenBagOrBoxCountIsNegative_ThrowsInvalidOperationException(int? numberOfBags, int? numberOfBoxes)
    {
        // Arrange
        var model = StdRequisitionTestData.CreateTransferFlatChargeModel(numberOfBags: numberOfBags, numberOfBoxes: numberOfBoxes);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdTransfer.Create(model));
    }
    
    [Fact]
    public void Create_WhenDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateTransferMileageModel() with
        {
            Date = default(DateOnly)
        };

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdTransfer.Create(model));
    }
    
    [Fact]
    public void Create_WhenFromShopSnapshotIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var fromShop = StdRequisitionTestData.CreateShopSnapshot(id: Guid.Empty, code: "S001", name: "From Shop");
        var toShop = StdRequisitionTestData.CreateShopSnapshot(code: "S002", name: "To Shop");

        var model = StdRequisitionTestData.CreateTransferMileageModel(
            fromShop: fromShop,
            toShop: toShop);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdTransfer.Create(model));
    }

    [Fact]
    public void Create_WhenToShopSnapshotIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var fromShop = StdRequisitionTestData.CreateShopSnapshot(code: "S001", name: "From Shop");
        var toShop = StdRequisitionTestData.CreateShopSnapshot(id: Guid.Empty, code: "S002", name: "To Shop");

        var model = StdRequisitionTestData.CreateTransferMileageModel(
            fromShop: fromShop,
            toShop: toShop);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdTransfer.Create(model));
    }
}