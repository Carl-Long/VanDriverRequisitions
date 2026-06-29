using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionVanPackSyncTests
{
    [Fact]
    public void Update_WhenExistingVanPackIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithVanPackOnly();

        var existingVanPack = requisition.CollectionVanPacks.Single();
        var existingVanPackId = PersistedEntityTestHelper.MarkAsPersisted(existingVanPack);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks:
            [
                StdRequisitionTestData.CreateCollectionVanPackModel(
                    id: existingVanPackId,
                    deliveryDate: new DateOnly(2026, 6, 20),
                    postCodeZone: "CD",
                    vanPacksOut: 10,
                    filledBags: 4,
                    ratePerVanPack: 2.50m)
            ],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedVanPack = Assert.Single(requisition.CollectionVanPacks);

        Assert.Equal(existingVanPackId, updatedVanPack.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedVanPack.DeliveryDate);
        Assert.Equal("CD", updatedVanPack.PostCodeZone);
        Assert.Equal(10, updatedVanPack.VanPacksOut);
        Assert.Equal(4, updatedVanPack.FilledBags);
        Assert.Equal(6, updatedVanPack.UnusedVanPacks);
        Assert.Equal(60.00m, updatedVanPack.PercentReturned);
        Assert.Equal(2.50m, updatedVanPack.RatePerVanPack);
        Assert.Equal(25.00m, updatedVanPack.TotalValue);

        Assert.Equal(25.00m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownVanPackIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithVanPackOnly();

        var existingVanPack = requisition.CollectionVanPacks.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingVanPack);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks:
            [
                StdRequisitionTestData.CreateCollectionVanPackModel(id: Guid.NewGuid())
            ],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedVanPackIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithVanPackOnly();

        var existingVanPack = requisition.CollectionVanPacks.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingVanPack);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.CollectionVanPacks);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingVanPackIsKeptAndNewVanPackIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithVanPackOnly();

        var existingVanPack = requisition.CollectionVanPacks.Single();
        var existingVanPackId = PersistedEntityTestHelper.MarkAsPersisted(existingVanPack);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks:
            [
                StdRequisitionTestData.CreateCollectionVanPackModel(
                    id: existingVanPackId,
                    postCodeZone: "CD",
                    vanPacksOut: 8,
                    filledBags: 6,
                    ratePerVanPack: 1.50m),

                StdRequisitionTestData.CreateCollectionVanPackModel(
                    id: null,
                    postCodeZone: "EF",
                    vanPacksOut: 4,
                    filledBags: 2,
                    ratePerVanPack: 3m)
            ],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.CollectionVanPacks.Count);

        Assert.Contains(requisition.CollectionVanPacks, x => x.Id == existingVanPackId);
        Assert.Contains(requisition.CollectionVanPacks, x => x.Id == Guid.Empty);

        Assert.Equal(24.00m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicateVanPackIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithVanPackOnly();

        var existingVanPack = requisition.CollectionVanPacks.Single();
        var existingVanPackId = PersistedEntityTestHelper.MarkAsPersisted(existingVanPack);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks:
            [
                StdRequisitionTestData.CreateCollectionVanPackModel(id: existingVanPackId),
                StdRequisitionTestData.CreateCollectionVanPackModel(id: existingVanPackId)
            ],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static StdRequisition CreateRequisitionWithVanPackOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [],
                collectionChargesBanksAndBins: [],
                additionalCosts: []));
    }
}