using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdRequisitionCreateTests
{
    [Fact]
    public void Create_WhenValid_SetsRequisitionNumberDetailsAndStatusToDraft()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Equal(StdRequisitionTestData.RequisitionNumber, requisition.RequisitionNumber);
        Assert.Equal(StdRequisitionTestData.RequisitionDate, requisition.RequisitionDate);
        Assert.Equal(RequisitionStatus.Draft, requisition.Status);
        Assert.True(requisition.CanSubmit);
        Assert.True(requisition.CanEdit);

        Assert.Equal(model.Details.Driver.Id, requisition.VanDriverId);
        Assert.Equal(model.Details.Driver.Code, requisition.VanDriverCode);
        Assert.Equal(model.Details.Driver.Name, requisition.VanDriverName);
        Assert.Equal(model.Details.Driver.TradersName, requisition.TradersName);
        Assert.Equal(model.Details.Driver.HasVat, requisition.IsVatApplicable);

        Assert.Equal(model.Details.Shop.Id, requisition.ShopId);
        Assert.Equal(model.Details.Shop.Code, requisition.ShopCode);
        Assert.Equal(model.Details.Shop.Name, requisition.ShopName);
    }

    [Fact]
    public void Create_WhenValid_CreatesAllChildRows()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Single(requisition.Pickups);
        Assert.Single(requisition.Transfers);
        Assert.Single(requisition.CollectionChargesBanksAndBins);
        Assert.Single(requisition.CollectionVanPacks);
        Assert.Single(requisition.AdditionalCosts);
    }

    [Fact]
    public void Create_WhenValid_CalculatesSubtotalFromAllChildRows()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Equal(StdRequisitionTestData.FullModelExpectedSubtotal, requisition.Subtotal);
    }

    [Fact]
    public void Create_WhenValid_HasNoSubmissionApprovalOrRejectionState()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Empty(requisition.Submissions);
        Assert.Null(requisition.LatestSubmission);
        Assert.Null(requisition.PendingSubmission);
        Assert.Equal(1, requisition.NextSubmissionNumber);

        Assert.Null(requisition.SubmittedById);
        Assert.Null(requisition.SubmittedByNameSnapshot);
        Assert.Null(requisition.SubmittedAtUtc);

        Assert.Null(requisition.ApprovedById);
        Assert.Null(requisition.ApprovedByNameSnapshot);
        Assert.Null(requisition.ApprovedAtUtc);
        Assert.Null(requisition.PoNumber);

        Assert.Null(requisition.RejectedById);
        Assert.Null(requisition.RejectedByNameSnapshot);
        Assert.Null(requisition.RejectedAtUtc);
        Assert.Null(requisition.RejectionNotes);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenRequisitionNumberIsEmptyOrWhitespace_ThrowsArgumentException(string requisitionNumber)
    {
        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            StdRequisition.Create(requisitionNumber, StdRequisitionTestData.CreateUpdateModel()));

        // Assert
        Assert.Equal("requisitionNumber", exception.ParamName);
    }

    [Fact]
    public void Create_WhenModelIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, null!));

        // Assert
        Assert.Equal("model", exception.ParamName);
    }

    [Fact]
    public void Create_WhenBanksAndBinsLocationDoesNotBelongToRequisitionShop_ThrowsInvalidOperationException()
    {
        // Arrange
        var invalidCollectionCharge = StdRequisitionTestData.CreateCollectionChargeMileageModel(
            locationShopId: Guid.NewGuid());

        var model = StdRequisitionTestData.CreateUpdateModel(
            collectionChargesBanksAndBins: [invalidCollectionCharge]);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            StdRequisition.Create(StdRequisitionTestData.RequisitionNumber, model));
    }
}