using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionPickupSyncTests
{
    [Fact]
    public void Update_WhenExistingPickupIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithPickupOnly();

        var existingPickup = requisition.Pickups.Single();
        var existingPickupId = PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups:
            [
                StdRequisitionTestData.CreatePickupMileageModel(
                    id: existingPickupId,
                    date: new DateOnly(2026, 6, 20),
                    numberOfBags: 8,
                    numberOfHouseholds: 4,
                    miles: 30,
                    ratePerMile: 0.75m)
            ],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedPickup = Assert.Single(requisition.Pickups);

        Assert.Equal(existingPickupId, updatedPickup.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedPickup.Date);
        Assert.Equal(8, updatedPickup.NumberOfBags);
        Assert.Equal(4, updatedPickup.NumberOfHouseholds);
        Assert.Equal(StdChargeType.Mileage, updatedPickup.ChargeType);
        Assert.Equal(30, updatedPickup.Miles);
        Assert.Equal(0.75m, updatedPickup.RatePerMile);
        Assert.Null(updatedPickup.FlatCharge);
        Assert.Equal(22.50m, updatedPickup.TotalValue);
        Assert.Equal(22.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownPickupIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithPickupOnly();

        var existingPickup = requisition.Pickups.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups:
            [
                StdRequisitionTestData.CreatePickupMileageModel(id: Guid.NewGuid())
            ],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedPickupIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithPickupOnly();

        var existingPickup = requisition.Pickups.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.Pickups);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingPickupIsKeptAndNewPickupIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithPickupOnly();

        var existingPickup = requisition.Pickups.Single();
        var existingPickupId = PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups:
            [
                StdRequisitionTestData.CreatePickupMileageModel(
                    id: existingPickupId,
                    numberOfBags: 8,
                    numberOfHouseholds: 4,
                    miles: 30,
                    ratePerMile: 0.75m),

                StdRequisitionTestData.CreatePickupFlatChargeModel(
                    id: null,
                    numberOfBags: 3,
                    numberOfHouseholds: 2,
                    flatCharge: 15m)
            ],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.Pickups.Count);

        Assert.Contains(requisition.Pickups, x => x.Id == existingPickupId);
        Assert.Contains(requisition.Pickups, x => x.Id == Guid.Empty);

        Assert.Equal(37.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingPickupChangesFromMileageToFlatCharge_RecalculatesAndClearsStaleMileageFields()
    {
        // Arrange
        var requisition = CreateRequisitionWithPickupOnly();

        var existingPickup = requisition.Pickups.Single();
        var existingPickupId = PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups:
            [
                StdRequisitionTestData.CreatePickupFlatChargeModel(
                    id: existingPickupId,
                    numberOfBags: 5,
                    numberOfHouseholds: 3,
                    flatCharge: 18m)
            ],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedPickup = Assert.Single(requisition.Pickups);

        Assert.Equal(existingPickupId, updatedPickup.Id);
        Assert.Equal(StdChargeType.FlatCharge, updatedPickup.ChargeType);
        Assert.Equal(18m, updatedPickup.FlatCharge);
        Assert.Equal(18m, updatedPickup.TotalValue);

        Assert.Null(updatedPickup.Miles);
        Assert.Null(updatedPickup.RatePerMile);

        Assert.Equal(18m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingPickupChangesFromFlatChargeToMileage_RecalculatesAndClearsStaleFlatCharge()
    {
        // Arrange
        var requisition = CreateRequisitionWithFlatChargePickupOnly();

        var existingPickup = requisition.Pickups.Single();
        var existingPickupId = PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups:
            [
                StdRequisitionTestData.CreatePickupMileageModel(
                    id: existingPickupId,
                    numberOfBags: 4,
                    numberOfHouseholds: 2,
                    miles: 12,
                    ratePerMile: 0.50m)
            ],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedPickup = Assert.Single(requisition.Pickups);

        Assert.Equal(existingPickupId, updatedPickup.Id);
        Assert.Equal(StdChargeType.Mileage, updatedPickup.ChargeType);
        Assert.Equal(12, updatedPickup.Miles);
        Assert.Equal(0.50m, updatedPickup.RatePerMile);
        Assert.Equal(6.00m, updatedPickup.TotalValue);

        Assert.Null(updatedPickup.FlatCharge);

        Assert.Equal(6.00m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicatePickupIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithPickupOnly();

        var existingPickup = requisition.Pickups.Single();
        var existingPickupId = PersistedEntityTestHelper.MarkAsPersisted(existingPickup);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups:
            [
                StdRequisitionTestData.CreatePickupMileageModel(id: existingPickupId),
                StdRequisitionTestData.CreatePickupMileageModel(id: existingPickupId)
            ],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static StdRequisition CreateRequisitionWithPickupOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                transfers: [],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: []));
    }

    private static StdRequisition CreateRequisitionWithFlatChargePickupOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [StdRequisitionTestData.CreatePickupFlatChargeModel()],
                transfers: [],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: []));
    }
}