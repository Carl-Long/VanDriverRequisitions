using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionAdditionalCostSyncTests
{
    [Fact]
    public void Update_WhenExistingAdditionalCostIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalFlatChargeOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var reasonId = Guid.NewGuid();

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts:
            [
                StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(
                    id: existingCostId,
                    date: new DateOnly(2026, 6, 20),
                    reasonId: reasonId,
                    reasonCode: "20001",
                    reasonText: "Updated parking",
                    numberOfBags: 4,
                    flatCharge: 12.50m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCost = Assert.Single(requisition.AdditionalCosts);

        Assert.Equal(existingCostId, updatedCost.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedCost.Date);
        Assert.Equal(reasonId, updatedCost.ReasonId);
        Assert.Equal("20001", updatedCost.ReasonCodeSnapshot);
        Assert.Equal("Updated parking", updatedCost.ReasonTextSnapshot);
        Assert.Equal(4, updatedCost.NumberOfBags);

        Assert.Equal(StdChargeType.FlatCharge, updatedCost.ChargeType);
        Assert.Equal(12.50m, updatedCost.FlatCharge);
        Assert.Null(updatedCost.Miles);
        Assert.Null(updatedCost.RatePerMile);

        Assert.Equal(12.50m, updatedCost.TotalValue);
        Assert.Equal(12.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownAdditionalCostIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalFlatChargeOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts:
            [
                StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(id: Guid.NewGuid())
            ]);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedAdditionalCostIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalFlatChargeOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.AdditionalCosts);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingAdditionalCostIsKeptAndNewAdditionalCostIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalFlatChargeOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts:
            [
                StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(
                    id: existingCostId,
                    numberOfBags: 4,
                    flatCharge: 12.50m),

                StdRequisitionTestData.CreateAdditionalMileageCostModel(
                    id: null,
                    numberOfBags: 2,
                    miles: 10,
                    ratePerMile: 0.50m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.AdditionalCosts.Count);

        Assert.Contains(requisition.AdditionalCosts, x => x.Id == existingCostId);
        Assert.Contains(requisition.AdditionalCosts, x => x.Id == Guid.Empty);

        Assert.Equal(17.50m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingAdditionalCostChangesFromFlatChargeToMileage_RecalculatesAndClearsStaleFlatCharge()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalFlatChargeOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var reasonId = Guid.NewGuid();

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts:
            [
                StdRequisitionTestData.CreateAdditionalMileageCostModel(
                    id: existingCostId,
                    reasonId: reasonId,
                    reasonCode: "30001",
                    reasonText: "Extra mileage",
                    numberOfBags: 3,
                    miles: 20,
                    ratePerMile: 0.75m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCost = Assert.Single(requisition.AdditionalCosts);

        Assert.Equal(existingCostId, updatedCost.Id);
        Assert.Equal(reasonId, updatedCost.ReasonId);
        Assert.Equal("30001", updatedCost.ReasonCodeSnapshot);
        Assert.Equal("Extra mileage", updatedCost.ReasonTextSnapshot);
        Assert.Equal(3, updatedCost.NumberOfBags);

        Assert.Equal(StdChargeType.Mileage, updatedCost.ChargeType);
        Assert.Equal(20, updatedCost.Miles);
        Assert.Equal(0.75m, updatedCost.RatePerMile);
        Assert.Null(updatedCost.FlatCharge);

        Assert.Equal(15.00m, updatedCost.TotalValue);
        Assert.Equal(15.00m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingAdditionalCostChangesFromMileageToFlatCharge_RecalculatesAndClearsStaleMileageFields()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalMileageOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var reasonId = Guid.NewGuid();

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts:
            [
                StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(
                    id: existingCostId,
                    reasonId: reasonId,
                    reasonCode: "40001",
                    reasonText: "Parking",
                    numberOfBags: 5,
                    flatCharge: 18m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCost = Assert.Single(requisition.AdditionalCosts);

        Assert.Equal(existingCostId, updatedCost.Id);
        Assert.Equal(reasonId, updatedCost.ReasonId);
        Assert.Equal("40001", updatedCost.ReasonCodeSnapshot);
        Assert.Equal("Parking", updatedCost.ReasonTextSnapshot);
        Assert.Equal(5, updatedCost.NumberOfBags);

        Assert.Equal(StdChargeType.FlatCharge, updatedCost.ChargeType);
        Assert.Equal(18m, updatedCost.FlatCharge);
        Assert.Null(updatedCost.Miles);
        Assert.Null(updatedCost.RatePerMile);

        Assert.Equal(18m, updatedCost.TotalValue);
        Assert.Equal(18m, requisition.Subtotal);
    }

    private static StdRequisition CreateRequisitionWithAdditionalFlatChargeOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: [StdRequisitionTestData.CreateAdditionalFlatChargeCostModel()]));
    }
    
    [Fact]
    public void Update_WhenDuplicateAdditionalCostIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalFlatChargeOnly();

        var existingCost = requisition.AdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            pickups: [],
            transfers: [],
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            additionalCosts:
            [
                StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(id: existingCostId),
                StdRequisitionTestData.CreateAdditionalFlatChargeCostModel(id: existingCostId)
            ]);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static StdRequisition CreateRequisitionWithAdditionalMileageOnly()
    {
        return StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: [StdRequisitionTestData.CreateAdditionalMileageCostModel()]));
    }
}