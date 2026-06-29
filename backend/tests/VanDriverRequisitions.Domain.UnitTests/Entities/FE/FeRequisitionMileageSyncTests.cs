using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.UnitTests.TestData;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionMileageSyncTests
{
    [Fact]
    public void Update_WhenExistingMileageIdIsProvided_UpdatesExistingRow()
    {
        // Arrange
        var requisition = CreateRequisitionWithMileageOnly();

        var existingMileage = requisition.FeMileages.Single();
        var existingMileageId = PersistedEntityTestHelper.MarkAsPersisted(existingMileage);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages:
            [
                FeRequisitionTestData.CreateMileageModel(
                    id: existingMileageId,
                    weekEndingDate: new DateOnly(2026, 6, 20),
                    week: CreateWeek(3, 3, 3, 3, 3, 3, 3),
                    ratePerMile: 0.75m)
            ],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedMileage = Assert.Single(requisition.FeMileages);

        Assert.Equal(existingMileageId, updatedMileage.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedMileage.WeekEndingDate);
        Assert.Equal(21, updatedMileage.TotalMiles);
        Assert.Equal(0.75m, updatedMileage.RatePerMile);
        Assert.Equal(15.75m, updatedMileage.TotalValue);
        Assert.Equal(15.75m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenUnknownMileageIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithMileageOnly();

        var existingMileage = requisition.FeMileages.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingMileage);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages:
            [
                FeRequisitionTestData.CreateMileageModel(id: Guid.NewGuid())
            ],
            transfers: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedMileageIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithMileageOnly();

        var existingMileage = requisition.FeMileages.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingMileage);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.FeMileages);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingMileageIsKeptAndNewMileageIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithMileageOnly();

        var existingMileage = requisition.FeMileages.Single();
        var existingMileageId = PersistedEntityTestHelper.MarkAsPersisted(existingMileage);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages:
            [
                FeRequisitionTestData.CreateMileageModel(
                    id: existingMileageId,
                    week: CreateWeek(3, 3, 3, 3, 3, 3, 3),
                    ratePerMile: 0.75m),

                FeRequisitionTestData.CreateMileageModel(
                    id: null,
                    week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
                    ratePerMile: 0.50m)
            ],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.FeMileages.Count);

        Assert.Contains(requisition.FeMileages, x => x.Id == existingMileageId);
        Assert.Contains(requisition.FeMileages, x => x.Id == Guid.Empty);

        Assert.Equal(19.25m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicateMileageIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithMileageOnly();

        var existingMileage = requisition.FeMileages.Single();
        var existingMileageId = PersistedEntityTestHelper.MarkAsPersisted(existingMileage);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages:
            [
                FeRequisitionTestData.CreateMileageModel(id: existingMileageId),
                FeRequisitionTestData.CreateMileageModel(id: existingMileageId)
            ],
            transfers: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static FeRequisition CreateRequisitionWithMileageOnly()
    {
        return FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                generalTasks: [],
                transfers: [],
                additionalCosts: []));
    }
}