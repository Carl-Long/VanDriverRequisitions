using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.UnitTests.TestData;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionTransferSyncTests
{
    [Fact]
    public void Update_WhenExistingTransferIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.FeTransfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var fromShop = FeRequisitionTestData.CreateShopSnapshot(
            id: Guid.NewGuid(),
            code: "S100",
            name: "Updated From Shop");

        var toShop = FeRequisitionTestData.CreateShopSnapshot(
            id: Guid.NewGuid(),
            code: "S200",
            name: "Updated To Shop");

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers:
            [
                FeRequisitionTestData.CreateTransferModel(
                    id: existingTransferId,
                    fromShop: fromShop,
                    toShop: toShop,
                    weekEndingDate: new DateOnly(2026, 6, 20),
                    week: CreateWeek(2, 2, 2, 2, 2, 2, 2),
                    ratePerJob: 3m)
            ],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedTransfer = Assert.Single(requisition.FeTransfers);

        Assert.Equal(existingTransferId, updatedTransfer.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedTransfer.WeekEndingDate);

        Assert.Equal(fromShop.Id, updatedTransfer.ShopIdFrom);
        Assert.Equal("S100", updatedTransfer.ShopCodeFrom);
        Assert.Equal("Updated From Shop", updatedTransfer.ShopNameFrom);

        Assert.Equal(toShop.Id, updatedTransfer.ShopIdTo);
        Assert.Equal("S200", updatedTransfer.ShopCodeTo);
        Assert.Equal("Updated To Shop", updatedTransfer.ShopNameTo);

        Assert.Equal(14, updatedTransfer.TotalNumber);
        Assert.Equal(3m, updatedTransfer.RatePerJob);
        Assert.Equal(42m, updatedTransfer.TotalValue);
        Assert.Equal(42m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownTransferIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.FeTransfers.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers:
            [
                FeRequisitionTestData.CreateTransferModel(id: Guid.NewGuid())
            ],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedTransferIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.FeTransfers.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.FeTransfers);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingTransferIsKeptAndNewTransferIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.FeTransfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers:
            [
                FeRequisitionTestData.CreateTransferModel(
                    id: existingTransferId,
                    fromShop: FeRequisitionTestData.CreateShopSnapshot(code: "S100", name: "Existing From Shop"),
                    toShop: FeRequisitionTestData.CreateShopSnapshot(code: "S200", name: "Existing To Shop"),
                    week: CreateWeek(2, 2, 2, 2, 2, 2, 2),
                    ratePerJob: 3m),

                FeRequisitionTestData.CreateTransferModel(
                    id: null,
                    fromShop: FeRequisitionTestData.CreateShopSnapshot(code: "S300", name: "New From Shop"),
                    toShop: FeRequisitionTestData.CreateShopSnapshot(code: "S400", name: "New To Shop"),
                    week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
                    ratePerJob: 4m)
            ],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.FeTransfers.Count);

        Assert.Contains(requisition.FeTransfers, x => x.Id == existingTransferId);
        Assert.Contains(requisition.FeTransfers, x => x.Id == Guid.Empty);

        Assert.Equal(70m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicateTransferIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithTransferOnly();

        var existingTransfer = requisition.FeTransfers.Single();
        var existingTransferId = PersistedEntityTestHelper.MarkAsPersisted(existingTransfer);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers:
            [
                FeRequisitionTestData.CreateTransferModel(id: existingTransferId),
                FeRequisitionTestData.CreateTransferModel(id: existingTransferId)
            ],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static FeRequisition CreateRequisitionWithTransferOnly()
    {
        return FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                generalTasks: [],
                mileages: [],
                additionalCosts: []));
    }
}