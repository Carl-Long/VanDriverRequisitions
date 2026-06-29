using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionBanksAndBinsSyncTests
{
    [Fact]
    public void Update_WhenExistingBanksAndBinsIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        var existingChargeId = PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var collectionTypeId = Guid.NewGuid();
        var locationId = Guid.NewGuid();

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeMileageModel(
                    id: existingChargeId,
                    date: new DateOnly(2026, 6, 20),
                    collectionTypeId: collectionTypeId,
                    locationId: locationId,
                    locationCollectionTypeId: collectionTypeId,
                    numberOfBags: 8,
                    miles: 30,
                    ratePerMile: 0.75m)
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCharge = Assert.Single(requisition.CollectionChargesBanksAndBins);

        Assert.Equal(existingChargeId, updatedCharge.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedCharge.Date);

        Assert.Equal(collectionTypeId, updatedCharge.CollectionTypeId);
        Assert.Equal("Banks", updatedCharge.CollectionTypeNameSnapshot);
        Assert.Equal("BANK", updatedCharge.CollectionTypeCodeSnapshot);

        Assert.Equal(locationId, updatedCharge.LocationId);
        Assert.Equal("Bank Location A", updatedCharge.LocationNameSnapshot);
        Assert.Equal("AB1 2CD", updatedCharge.LocationPostCodeSnapshot);

        Assert.Equal(8, updatedCharge.NumberOfBags);

        Assert.Equal(StdChargeType.Mileage, updatedCharge.ChargeType);
        Assert.Equal(30, updatedCharge.Miles);
        Assert.Equal(0.75m, updatedCharge.RatePerMile);
        Assert.Null(updatedCharge.FlatCharge);

        Assert.Equal(22.50m, updatedCharge.TotalValue);
        Assert.Equal(22.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownBanksAndBinsIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeMileageModel(id: Guid.NewGuid())
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedBanksAndBinsRowIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.CollectionChargesBanksAndBins);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingBanksAndBinsRowIsKeptAndNewRowIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        var existingChargeId = PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeMileageModel(
                    id: existingChargeId,
                    numberOfBags: 8,
                    miles: 30,
                    ratePerMile: 0.75m),

                StdRequisitionTestData.CreateCollectionChargeFlatChargeModel(
                    id: null,
                    numberOfBags: 4,
                    flatCharge: 12m)
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.CollectionChargesBanksAndBins.Count);

        Assert.Contains(requisition.CollectionChargesBanksAndBins, x => x.Id == existingChargeId);
        Assert.Contains(requisition.CollectionChargesBanksAndBins, x => x.Id == Guid.Empty);

        Assert.Equal(34.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingBanksAndBinsChangesFromMileageToFlatCharge_RecalculatesAndClearsStaleMileageFields()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        var existingChargeId = PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeFlatChargeModel(
                    id: existingChargeId,
                    numberOfBags: 5,
                    flatCharge: 18m)
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCharge = Assert.Single(requisition.CollectionChargesBanksAndBins);

        Assert.Equal(existingChargeId, updatedCharge.Id);
        Assert.Equal(StdChargeType.FlatCharge, updatedCharge.ChargeType);
        Assert.Equal(18m, updatedCharge.FlatCharge);
        Assert.Equal(18m, updatedCharge.TotalValue);

        Assert.Null(updatedCharge.Miles);
        Assert.Null(updatedCharge.RatePerMile);

        Assert.Equal(18m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingBanksAndBinsChangesFromFlatChargeToMileage_RecalculatesAndClearsStaleFlatCharge()
    {
        // Arrange
        var requisition = CreateRequisitionWithFlatChargeBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        var existingChargeId = PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeMileageModel(
                    id: existingChargeId,
                    numberOfBags: 4,
                    miles: 12,
                    ratePerMile: 0.50m)
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCharge = Assert.Single(requisition.CollectionChargesBanksAndBins);

        Assert.Equal(existingChargeId, updatedCharge.Id);
        Assert.Equal(StdChargeType.Mileage, updatedCharge.ChargeType);
        Assert.Equal(12, updatedCharge.Miles);
        Assert.Equal(0.50m, updatedCharge.RatePerMile);
        Assert.Equal(6.00m, updatedCharge.TotalValue);

        Assert.Null(updatedCharge.FlatCharge);

        Assert.Equal(6.00m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenLocationDoesNotBelongToSelectedShop_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        var existingChargeId = PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeMileageModel(
                    id: existingChargeId,
                    locationShopId: Guid.NewGuid())
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }
    
    [Fact]
    public void Update_WhenDuplicateBanksAndBinsIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithBanksAndBinsOnly();

        var existingCharge = requisition.CollectionChargesBanksAndBins.Single();
        var existingChargeId = PersistedEntityTestHelper.MarkAsPersisted(existingCharge);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins:
            [
                StdRequisitionTestData.CreateCollectionChargeMileageModel(id: existingChargeId),
                StdRequisitionTestData.CreateCollectionChargeMileageModel(id: existingChargeId)
            ],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static StdRequisition CreateRequisitionWithBanksAndBinsOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [],
                collectionVanPacks: [],
                additionalCosts: []));
    }

    private static StdRequisition CreateRequisitionWithFlatChargeBanksAndBinsOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [],
                collectionChargesBanksAndBins: [StdRequisitionTestData.CreateCollectionChargeFlatChargeModel()],
                collectionVanPacks: [],
                additionalCosts: []));
    }
}