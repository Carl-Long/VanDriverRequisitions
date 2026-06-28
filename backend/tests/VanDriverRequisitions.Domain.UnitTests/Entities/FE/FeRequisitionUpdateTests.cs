using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionUpdateTests
{
    [Fact]
    public void Update_WhenDetailsChange_UpdatesDetails()
    {
        // Arrange
        var requisition = CreateRequisition();

        var newDriver = FeRequisitionTestData.CreateDriverSnapshot(
            code: "810999",
            name: "Jane Smith",
            tradersName: "Jane Smith Trading",
            hasVat: false);

        var newShop = FeRequisitionTestData.CreateShopSnapshot(code: "S999", name: "Updated Shop");

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            details: FeRequisitionTestData.CreateDetails(
                requisitionDate: new DateOnly(2026, 6, 20),
                driver: newDriver,
                shop: newShop));

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(new DateOnly(2026, 6, 20), requisition.RequisitionDate);

        Assert.Equal(newDriver.Id, requisition.VanDriverId);
        Assert.Equal("810999", requisition.VanDriverCode);
        Assert.Equal("Jane Smith", requisition.VanDriverName);
        Assert.Equal("Jane Smith Trading", requisition.TradersName);
        Assert.False(requisition.IsVatApplicable);

        Assert.Equal(newShop.Id, requisition.ShopId);
        Assert.Equal("S999", requisition.ShopCode);
        Assert.Equal("Updated Shop", requisition.ShopName);
    }

    [Fact]
    public void Update_WhenAllRowsAreRemoved_RemovesChildRowsAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = CreateRequisition();

        var updateModel = FeRequisitionTestData.CreateUpdateModel(generalTasks: [], mileages: [], transfers: [], additionalCosts: []);

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Empty(requisition.FeGeneralTasks);
        Assert.Empty(requisition.FeMileages);
        Assert.Empty(requisition.FeTransfers);
        Assert.Empty(requisition.FeAdditionalCosts);
        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenNewRowsAreProvided_AddsRowsAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = FeRequisition.Create(
            FeRequisitionTestData.RequisitionNumber,
            FeRequisitionTestData.CreateUpdateModel(generalTasks: [], mileages: [], transfers: [], additionalCosts: []));

        var updateModel = FeRequisitionTestData.CreateUpdateModel();

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Single(requisition.FeGeneralTasks);
        Assert.Single(requisition.FeMileages);
        Assert.Single(requisition.FeTransfers);
        Assert.Equal(2, requisition.FeAdditionalCosts.Count);

        Assert.Equal(FeRequisitionTestData.FullModelExpectedSubtotal, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenModelIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => requisition.Update(null!));

        // Assert
        Assert.Equal("model", exception.ParamName);
    }
    
    [Fact]
    public void Update_WhenStatusIsDraft_AllowsUpdate()
    {
        // Arrange
        var requisition = CreateRequisition();

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            details: FeRequisitionTestData.CreateDetails(
                requisitionDate: new DateOnly(2026, 6, 20)));

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(new DateOnly(2026, 6, 20), requisition.RequisitionDate);
        Assert.True(requisition.CanEdit);
        Assert.True(requisition.CanSubmit);
    }
    
    [Fact]
    public void Update_WhenStatusIsSubmitted_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        requisition.Submit(
            FeRequisitionTestData.CreateAuditUser(),
            new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc),
            snapshotJson: "{}");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(FeRequisitionTestData.CreateUpdateModel()));
        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);
    }
    
    [Fact]
    public void Update_WhenStatusIsRejected_UpdatesRequisition()
    {
        // Arrange
        var requisition = CreateRequisition();

        requisition.Submit(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc),
            snapshotJson: "{}");

        requisition.RejectSubmission(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            new DateTime(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc),
            rejectionNotes: "Incorrect rate.");

        var updateModel = FeRequisitionTestData.CreateUpdateModel(
            details: FeRequisitionTestData.CreateDetails(
                requisitionDate: new DateOnly(2026, 6, 20)));

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Equal(new DateOnly(2026, 6, 20), requisition.RequisitionDate);
        Assert.True(requisition.CanEdit);
        Assert.True(requisition.CanSubmit);
    }
    
    [Fact]
    public void Update_WhenStatusIsApproved_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        requisition.Submit(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc),
            snapshotJson: "{}");

        requisition.ApproveSubmission(
            FeRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
            new DateTime(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc),
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(FeRequisitionTestData.CreateUpdateModel()));
        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);
    }
    
    [Fact]
    public void Update_WhenDetailsIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        var validModel = FeRequisitionTestData.CreateUpdateModel();
        var updateModel = validModel with { Details = null! };

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => requisition.Update(updateModel));

        // Assert
        Assert.Equal("details", exception.ParamName);
    }

    [Fact]
    public void Update_WhenDriverSnapshotIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        var details = new RequisitionDetails(
            FeRequisitionTestData.RequisitionDate,
            Driver: null!,
            Shop: FeRequisitionTestData.CreateShopSnapshot());

        var updateModel = FeRequisitionTestData.CreateUpdateModel(details: details);

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => requisition.Update(updateModel));

        // Assert
        Assert.Equal("Driver", exception.ParamName);
    }

    [Fact]
    public void Update_WhenShopSnapshotIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        var details = new RequisitionDetails(
            FeRequisitionTestData.RequisitionDate,
            Driver: FeRequisitionTestData.CreateDriverSnapshot(),
            Shop: null!);

        var updateModel = FeRequisitionTestData.CreateUpdateModel(details: details);

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => requisition.Update(updateModel));

        // Assert
        Assert.Equal("Shop", exception.ParamName);
    }

    private static FeRequisition CreateRequisition()
    {
        return FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, FeRequisitionTestData.CreateUpdateModel());
    }
}