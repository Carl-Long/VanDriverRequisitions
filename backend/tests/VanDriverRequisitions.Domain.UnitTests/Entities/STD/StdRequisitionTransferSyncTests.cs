using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionTransferSyncTests
{
    [Fact]
    public void Update_WhenExistingTransferIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var fromShop = StdRequisitionTestData.CreateShopSnapshot(
            id: Guid.NewGuid(),
            code: "S100",
            name: "Updated From Shop");

        var toShop = StdRequisitionTestData.CreateShopSnapshot(
            id: Guid.NewGuid(),
            code: "S200",
            name: "Updated To Shop");

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers:
            [
                StdRequisitionTestData.CreateTransferMileageModel(
                    id: existingTransferId,
                    date: new DateOnly(2026, 6, 20),
                    fromShop: fromShop,
                    toShop: toShop,
                    numberOfBags: 8,
                    numberOfBoxes: 3,
                    numberOfMiles: 30,
                    ratePerMile: 0.75m)
            ],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedTransfer = Assert.Single(requisition.Transfers);

        Assert.Equal(existingTransferId, updatedTransfer.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedTransfer.Date);

        Assert.Equal(fromShop.Id, updatedTransfer.ShopIdFrom);
        Assert.Equal("S100", updatedTransfer.ShopCodeFrom);
        Assert.Equal("Updated From Shop", updatedTransfer.ShopNameFrom);

        Assert.Equal(toShop.Id, updatedTransfer.ShopIdTo);
        Assert.Equal("S200", updatedTransfer.ShopCodeTo);
        Assert.Equal("Updated To Shop", updatedTransfer.ShopNameTo);

        Assert.Equal(8, updatedTransfer.NumberOfBags);
        Assert.Equal(3, updatedTransfer.NumberOfBoxes);

        Assert.Equal(StdChargeType.Mileage, updatedTransfer.ChargeType);
        Assert.Equal(30, updatedTransfer.Miles);
        Assert.Equal(0.75m, updatedTransfer.RatePerMile);
        Assert.Null(updatedTransfer.FlatCharge);

        Assert.Equal(22.50m, updatedTransfer.TotalValue);
        Assert.Equal(22.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownTransferIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers:
            [
                StdRequisitionTestData.CreateTransferFlatChargeModel(id: Guid.NewGuid())
            ],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedTransferIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.Transfers);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingTransferIsKeptAndNewTransferIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers:
            [
                StdRequisitionTestData.CreateTransferMileageModel(
                    id: existingTransferId,
                    numberOfBags: 8,
                    numberOfBoxes: 3,
                    numberOfMiles: 30,
                    ratePerMile: 0.75m),

                StdRequisitionTestData.CreateTransferFlatChargeModel(
                    id: null,
                    numberOfBags: 4,
                    numberOfBoxes: 1,
                    flatCharge: 12m)
            ],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.Transfers.Count);

        Assert.Contains(requisition.Transfers, x => x.Id == existingTransferId);
        Assert.Contains(requisition.Transfers, x => x.Id == Guid.Empty);

        Assert.Equal(34.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingTransferChangesFromMileageToFlatCharge_RecalculatesAndClearsStaleMileageFields()
    {
        // Arrange
        var requisition = CreateRequisitionWithMileageTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers:
            [
                StdRequisitionTestData.CreateTransferFlatChargeModel(
                    id: existingTransferId,
                    numberOfBags: 4,
                    numberOfBoxes: 2,
                    flatCharge: 18m)
            ],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedTransfer = Assert.Single(requisition.Transfers);

        Assert.Equal(existingTransferId, updatedTransfer.Id);
        Assert.Equal(StdChargeType.FlatCharge, updatedTransfer.ChargeType);
        Assert.Equal(18m, updatedTransfer.FlatCharge);
        Assert.Equal(18m, updatedTransfer.TotalValue);

        Assert.Null(updatedTransfer.Miles);
        Assert.Null(updatedTransfer.RatePerMile);

        Assert.Equal(18m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingTransferChangesFromFlatChargeToMileage_RecalculatesAndClearsStaleFlatCharge()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers:
            [
                StdRequisitionTestData.CreateTransferMileageModel(
                    id: existingTransferId,
                    numberOfBags: 4,
                    numberOfBoxes: 2,
                    numberOfMiles: 12,
                    ratePerMile: 0.50m)
            ],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedTransfer = Assert.Single(requisition.Transfers);

        Assert.Equal(existingTransferId, updatedTransfer.Id);
        Assert.Equal(StdChargeType.Mileage, updatedTransfer.ChargeType);
        Assert.Equal(12, updatedTransfer.Miles);
        Assert.Equal(0.50m, updatedTransfer.RatePerMile);
        Assert.Equal(6.00m, updatedTransfer.TotalValue);

        Assert.Null(updatedTransfer.FlatCharge);

        Assert.Equal(6.00m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicateTransferIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.Transfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers:
            [
                StdRequisitionTestData.CreateTransferFlatChargeModel(id: existingTransferId),
                StdRequisitionTestData.CreateTransferFlatChargeModel(id: existingTransferId)
            ],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static StdRequisition CreateRequisitionWithTransferOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: []));
    }

    private static StdRequisition CreateRequisitionWithMileageTransferOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [StdRequisitionTestData.CreateTransferMileageModel()],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: []));
    }
}