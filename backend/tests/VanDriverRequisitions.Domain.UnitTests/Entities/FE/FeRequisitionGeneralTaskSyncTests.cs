using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.UnitTests.TestData;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionGeneralTaskSyncTests
{
    [Fact]
    public void Update_WhenExistingGeneralTaskIdIsProvided_UpdatesQuantitiesRateAndTotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithGeneralTaskOnly();

        var existingTask = requisition.FeGeneralTasks.Single();
        var existingTaskId = PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: existingTaskId,
                    feTaskTypeId: existingTask.FeTaskTypeId,
                    taskTypeName: existingTask.TaskTypeName,
                    taskTypeCode: existingTask.TaskTypeCode,
                    weekEndingDate: new DateOnly(2026, 6, 20),
                    week: CreateWeek(2, 2, 2, 2, 2, 2, 2),
                    ratePerJob: 3m)
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedTask = Assert.Single(requisition.FeGeneralTasks);

        Assert.Equal(existingTaskId, updatedTask.Id);
        Assert.Equal(new DateOnly(2026, 6, 20), updatedTask.WeekEndingDate);
        Assert.Equal(14, updatedTask.TotalNumber);
        Assert.Equal(3m, updatedTask.RatePerJob);
        Assert.Equal(42m, updatedTask.TotalValue);
        Assert.Equal(42m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingGeneralTaskIdIsProvided_PreservesOriginalTaskTypeSnapshot()
    {
        // Arrange
        var originalTaskTypeId = Guid.NewGuid();

        var requisition = FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                generalTasks:
                [
                    FeRequisitionTestData.CreateGeneralTaskModel(
                        feTaskTypeId: originalTaskTypeId,
                        taskTypeName: "Original task type",
                        taskTypeCode: "10001")
                ],
                mileages: [],
                transfers: [],
                additionalCosts: []));

        var existingTask = requisition.FeGeneralTasks.Single();
        var existingTaskId = PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: existingTaskId,
                    feTaskTypeId: originalTaskTypeId,
                    taskTypeName: "Changed task type name should be ignored",
                    taskTypeCode: "99999",
                    week: CreateWeek(2, 2, 2, 2, 2, 2, 2),
                    ratePerJob: 3m)
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        var updatedTask = Assert.Single(requisition.FeGeneralTasks);

        Assert.Equal(originalTaskTypeId, updatedTask.FeTaskTypeId);
        Assert.Equal("Original task type", updatedTask.TaskTypeName);
        Assert.Equal("10001", updatedTask.TaskTypeCode);
    }

    [Fact]
    public void Update_WhenExistingGeneralTaskChangesTaskType_ThrowsInvalidOperationException()
    {
        // Arrange
        var originalTaskTypeId = Guid.NewGuid();

        var requisition = FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                generalTasks:
                [
                    FeRequisitionTestData.CreateGeneralTaskModel(
                        feTaskTypeId: originalTaskTypeId,
                        taskTypeName: "Original task type",
                        taskTypeCode: "10001")
                ],
                mileages: [],
                transfers: [],
                additionalCosts: []));

        var existingTask = requisition.FeGeneralTasks.Single();
        var existingTaskId = PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: existingTaskId,
                    feTaskTypeId: Guid.NewGuid(),
                    taskTypeName: "Different task type",
                    taskTypeCode: "99999")
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenUnknownGeneralTaskIdIsProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithGeneralTaskOnly();

        var existingTask = requisition.FeGeneralTasks.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(id: Guid.NewGuid())
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    [Fact]
    public void Update_WhenPersistedGeneralTaskIsOmitted_RemovesRowAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisitionWithGeneralTaskOnly();

        var existingTask = requisition.FeGeneralTasks.Single();
        PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks: [],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.FeGeneralTasks);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenExistingGeneralTaskIsKeptAndNewGeneralTaskIsAdded_SyncsBothRows()
    {
        // Arrange
        var requisition = CreateRequisitionWithGeneralTaskOnly();

        var existingTask = requisition.FeGeneralTasks.Single();
        var existingTaskId = PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: existingTaskId,
                    feTaskTypeId: existingTask.FeTaskTypeId,
                    taskTypeName: existingTask.TaskTypeName,
                    taskTypeCode: existingTask.TaskTypeCode,
                    week: CreateWeek(2, 2, 2, 2, 2, 2, 2),
                    ratePerJob: 3m),

                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: null,
                    week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
                    ratePerJob: 4m)
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(2, requisition.FeGeneralTasks.Count);

        Assert.Contains(requisition.FeGeneralTasks, x => x.Id == existingTaskId);
        Assert.Contains(requisition.FeGeneralTasks, x => x.Id == Guid.Empty);

        Assert.Equal(70m, requisition.Subtotal);
    }
    
    [Fact]
    public void Update_WhenDuplicateGeneralTaskIdsAreProvided_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisitionWithGeneralTaskOnly();

        var existingTask = requisition.FeGeneralTasks.Single();
        var existingTaskId = PersistedEntityTestHelper.MarkAsPersisted(existingTask);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: existingTaskId,
                    feTaskTypeId: existingTask.FeTaskTypeId,
                    taskTypeName: existingTask.TaskTypeName,
                    taskTypeCode: existingTask.TaskTypeCode),

                FeRequisitionTestData.CreateGeneralTaskModel(
                    id: existingTaskId,
                    feTaskTypeId: existingTask.FeTaskTypeId,
                    taskTypeName: existingTask.TaskTypeName,
                    taskTypeCode: existingTask.TaskTypeCode)
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static FeRequisition CreateRequisitionWithGeneralTaskOnly()
    {
        return FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(
                mileages: [],
                transfers: [],
                additionalCosts: []));
    }
}