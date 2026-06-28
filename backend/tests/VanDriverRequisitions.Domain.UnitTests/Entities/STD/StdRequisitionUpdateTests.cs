using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionUpdateTests
{
    [Fact]
    public void Update_WhenDetailsChange_UpdatesDetails()
    {
        // Arrange
        var requisition = CreateRequisition();

        var newDriver = StdRequisitionTestData.CreateDriverSnapshot(
            code: "810999",
            name: "Jane Smith",
            tradersName: "Jane Smith Trading",
            hasVat: false);

        var newShop = StdRequisitionTestData.CreateShopSnapshot(
            id: StdRequisitionTestData.DefaultShopId,
            code: "S999",
            name: "Updated Shop");

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            details: StdRequisitionTestData.CreateDetails(
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
        Assert.Empty(requisition.Transfers);
        Assert.Empty(requisition.CollectionChargesBanksAndBins);
        Assert.Empty(requisition.CollectionVanPacks);
        Assert.Empty(requisition.AdditionalCosts);

        Assert.Equal(0m, requisition.Subtotal);
    }

    [Fact]
    public void Update_WhenNewRowsAreProvided_AddsRowsAndRecalculatesSubtotal()
    {
        // Arrange
        var requisition = StdRequisition.Create(
            StdRequisitionTestData.RequisitionNumber,
            StdRequisitionTestData.CreateUpdateModel(
                pickups: [],
                transfers: [],
                collectionChargesBanksAndBins: [],
                collectionVanPacks: [],
                additionalCosts: []));

        var updateModel = StdRequisitionTestData.CreateUpdateModel();

        // Act
        requisition.Update(updateModel);

        // Assert
        Assert.Single(requisition.Pickups);
        Assert.Single(requisition.Transfers);
        Assert.Single(requisition.CollectionChargesBanksAndBins);
        Assert.Single(requisition.CollectionVanPacks);
        Assert.Single(requisition.AdditionalCosts);

        Assert.Equal(StdRequisitionTestData.FullModelExpectedSubtotal, requisition.Subtotal);
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

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            details: StdRequisitionTestData.CreateDetails(requisitionDate: new DateOnly(2026, 6, 20)));

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
            StdRequisitionTestData.CreateAuditUser(),
            new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc),
            snapshotJson: "{}");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.Update(StdRequisitionTestData.CreateUpdateModel()));

        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);
    }

    [Fact]
    public void Update_WhenStatusIsRejected_AllowsUpdate()
    {
        // Arrange
        var requisition = CreateRequisition();

        requisition.Submit(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc),
            snapshotJson: "{}");

        requisition.RejectSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Rejecter"),
            new DateTime(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc),
            rejectionNotes: "Incorrect rate.");

        var updateModel = StdRequisitionTestData.CreateUpdateModel(
            details: StdRequisitionTestData.CreateDetails(
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
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Submitter"),
            new DateTime(2026, 6, 13, 10, 0, 0, DateTimeKind.Utc),
            snapshotJson: "{}");

        requisition.ApproveSubmission(
            StdRequisitionTestData.CreateAuditUser(nameSnapshot: "Approver"),
            new DateTime(2026, 6, 14, 10, 0, 0, DateTimeKind.Utc),
            poNumber: "PO-123");

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            requisition.Update(StdRequisitionTestData.CreateUpdateModel()));

        Assert.False(requisition.CanEdit);
        Assert.False(requisition.CanSubmit);
    }

    [Fact]
    public void Update_WhenBanksAndBinsLocationDoesNotBelongToRequisitionShop_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        var invalidCollectionCharge = StdRequisitionTestData.CreateCollectionChargeMileageModel(locationShopId: Guid.NewGuid());

        var updateModel = StdRequisitionTestData.CreateUpdateModel(collectionChargesBanksAndBins: [invalidCollectionCharge]);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }
    
    [Fact]
    public void Update_WhenDetailsIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var requisition = CreateRequisition();

        var validModel = StdRequisitionTestData.CreateUpdateModel();
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

        var details = new StdRequisitionDetails(
            StdRequisitionTestData.RequisitionDate,
            Driver: null!,
            Shop: StdRequisitionTestData.CreateShopSnapshot(id: StdRequisitionTestData.DefaultShopId));

        var updateModel = StdRequisitionTestData.CreateUpdateModel(details: details);

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

        var details = new StdRequisitionDetails(
            StdRequisitionTestData.RequisitionDate,
            Driver: StdRequisitionTestData.CreateDriverSnapshot(),
            Shop: null!);

        var updateModel = StdRequisitionTestData.CreateUpdateModel(details: details);

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => requisition.Update(updateModel));

        // Assert
        Assert.Equal("Shop", exception.ParamName);
    }
    
    [Fact]
    public void Update_WhenRequisitionDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var requisition = CreateRequisition();

        var details = new StdRequisitionDetails(
            RequisitionDate: default,
            Driver: StdRequisitionTestData.CreateDriverSnapshot(),
            Shop: StdRequisitionTestData.CreateShopSnapshot());

        var updateModel = StdRequisitionTestData.CreateUpdateModel(details: details);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => requisition.Update(updateModel));
    }

    private static StdRequisition CreateRequisition()
    {
        return StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, StdRequisitionTestData.CreateUpdateModel());
    }
}