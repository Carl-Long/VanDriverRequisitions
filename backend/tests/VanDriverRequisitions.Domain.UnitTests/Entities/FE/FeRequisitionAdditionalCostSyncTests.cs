using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionAdditionalCostSyncTests
{
    [Fact]
    public void Update_WhenExistingAdditionalCostIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalJobCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts:
            [
                FeRequisitionTestData.CreateAdditionalJobCostModel(
                    id: existingCostId,
                    weekEndingDate: new DateOnly(2026, 6, 20),
                    reasonId: Guid.NewGuid(),
                    reasonCode: "20001",
                    reasonText: "Updated parking",
                    totalNumber: 4,
                    ratePerJob: 12.50m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCost = Assert.Single(requisition.FeAdditionalCosts);

        Assert.Equal(existingCostId, updatedCost.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedCost.WeekEndingDate);
        Assert.Equal("20001", updatedCost.ReasonCodeSnapshot);
        Assert.Equal("Updated parking", updatedCost.ReasonTextSnapshot);
        Assert.Equal(ChargingOption.Job, updatedCost.ChargingOption);
        Assert.Equal(4, updatedCost.TotalNumber);
        Assert.Equal(12.50m, updatedCost.RatePerJob);
        Assert.Equal(50.00m, updatedCost.TotalValue);
        Assert.Null(updatedCost.Miles);
        Assert.Null(updatedCost.RatePerMile);

        Assert.Equal(50.00m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownAdditionalCostIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalJobCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts:
            [
                FeRequisitionTestData.CreateAdditionalJobCostModel(id: Guid.NewGuid())
            ]);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedAdditionalCostIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalJobCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.FeAdditionalCosts);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingAdditionalCostIsKeptAndNewAdditionalCostIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalJobCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts:
            [
                FeRequisitionTestData.CreateAdditionalJobCostModel(
                    id: existingCostId,
                    totalNumber: 4,
                    ratePerJob: 12.50m),

                FeRequisitionTestData.CreateAdditionalMileageCostModel(
                    id: null,
                    miles: 10,
                    ratePerMile: 0.50m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.FeAdditionalCosts.Count);

        Assert.Contains(requisition.FeAdditionalCosts, x => x.Id == existingCostId);
        Assert.Contains(requisition.FeAdditionalCosts, x => x.Id == Guid.Empty);

        Assert.Equal(55.00m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingAdditionalCostChangesFromJobToMileage_RecalculatesAndClearsStaleJobFields()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalJobCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts:
            [
                FeRequisitionTestData.CreateAdditionalMileageCostModel(
                    id: existingCostId,
                    reasonId: Guid.NewGuid(),
                    reasonCode: "30001",
                    reasonText: "Extra mileage",
                    miles: 20,
                    ratePerMile: 0.75m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCost = Assert.Single(requisition.FeAdditionalCosts);

        Assert.Equal(existingCostId, updatedCost.Id);
        Assert.Equal("30001", updatedCost.ReasonCodeSnapshot);
        Assert.Equal("Extra mileage", updatedCost.ReasonTextSnapshot);
        Assert.Equal(ChargingOption.Mileage, updatedCost.ChargingOption);

        Assert.Equal(20, updatedCost.Miles);
        Assert.Equal(0.75m, updatedCost.RatePerMile);
        Assert.Equal(15.00m, updatedCost.TotalValue);

        Assert.Null(updatedCost.TotalNumber);
        Assert.Null(updatedCost.RatePerJob);

        Assert.Equal(15.00m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingAdditionalCostChangesFromMileageToJob_RecalculatesAndClearsStaleMileageFields()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalMileageCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts:
            [
                FeRequisitionTestData.CreateAdditionalJobCostModel(
                    id: existingCostId,
                    reasonId: Guid.NewGuid(),
                    reasonCode: "40001",
                    reasonText: "Parking",
                    totalNumber: 5,
                    ratePerJob: 8m)
            ]);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedCost = Assert.Single(requisition.FeAdditionalCosts);

        Assert.Equal(existingCostId, updatedCost.Id);
        Assert.Equal("40001", updatedCost.ReasonCodeSnapshot);
        Assert.Equal("Parking", updatedCost.ReasonTextSnapshot);
        Assert.Equal(ChargingOption.Job, updatedCost.ChargingOption);

        Assert.Equal(5, updatedCost.TotalNumber);
        Assert.Equal(8m, updatedCost.RatePerJob);
        Assert.Equal(40.00m, updatedCost.TotalValue);

        Assert.Null(updatedCost.Miles);
        Assert.Null(updatedCost.RatePerMile);

        Assert.Equal(40.00m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicateAdditionalCostIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithAdditionalJobCostOnly();

        var existingCost = requisition.FeAdditionalCosts.Single();
        var existingCostId = PersistedEntityTestHelper.MarkAsPersisted(existingCost);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts:
            [
                FeRequisitionTestData.CreateAdditionalJobCostModel(id: existingCostId),
                FeRequisitionTestData.CreateAdditionalJobCostModel(id: existingCostId)
            ]);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static FeRequisition CreateRequisitionWithAdditionalJobCostOnly()
    {
        return FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                generalTasks: [],
                mileages: [],
                transfers: [],
                additionalCosts: [FeRequisitionTestData.CreateAdditionalJobCostModel()]));
    }

    private static FeRequisition CreateRequisitionWithAdditionalMileageCostOnly()
    {
        return FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                generalTasks: [],
                mileages: [],
                transfers: [],
                additionalCosts: [FeRequisitionTestData.CreateAdditionalMileageCostModel()]));
    }
}