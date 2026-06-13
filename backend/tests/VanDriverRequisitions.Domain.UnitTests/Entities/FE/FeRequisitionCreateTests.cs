using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeRequisitionCreateTests
{
    [Fact]
    public void Create_WhenValid_SetsRequisitionNumberDetailsAndStatusToDraft()
    {
        // Arrange
        var model = FeRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Equal(FeRequisitionTestData.RequisitionNumber, requisition.RequisitionNumber);
        Assert.Equal(FeRequisitionTestData.RequisitionDate, requisition.RequisitionDate);
        Assert.Equal(RequisitionStatus.Draft, requisition.Status);
        Assert.True(requisition.CanSubmit);

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
        var model = FeRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Single(requisition.FeGeneralTasks);
        Assert.Single(requisition.FeMileages);
        Assert.Single(requisition.FeTransfers);
        Assert.Equal(2, requisition.FeAdditionalCosts.Count);
    }

    [Fact]
    public void Create_WhenValid_CalculatesSubtotalFromAllChildRows()
    {
        // Arrange
        var model = FeRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Equal(FeRequisitionTestData.FullModelExpectedSubtotal, requisition.Subtotal);
    }

    [Fact]
    public void Create_WhenValid_HasNoSubmissionApprovalOrRejectionState()
    {
        // Arrange
        var model = FeRequisitionTestData.CreateUpdateModel();

        // Act
        var requisition = FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, model);

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

    [Fact]
    public void Create_WhenOnlyGeneralTasksAreProvided_CalculatesSubtotalFromGeneralTasksOnly()
    {
        // Arrange
        var model = FeRequisitionTestData.CreateUpdateModel(
            generalTasks:
            [
                FeRequisitionTestData.CreateGeneralTaskModel(
                    week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
                    ratePerJob: 10m)
            ],
            mileages: [],
            transfers: [],
            additionalCosts: []);

        // Act
        var requisition = FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, model);

        // Assert
        Assert.Equal(70.00m, requisition.Subtotal);
        Assert.Single(requisition.FeGeneralTasks);
        Assert.Empty(requisition.FeMileages);
        Assert.Empty(requisition.FeTransfers);
        Assert.Empty(requisition.FeAdditionalCosts);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenRequisitionNumberIsEmptyOrWhitespace_ThrowsArgumentException(
        string requisitionNumber)
    {
        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            FeRequisition.Create(requisitionNumber, FeRequisitionTestData.CreateUpdateModel()));

        // Assert
        Assert.Equal("requisitionNumber", exception.ParamName);
    }

    [Fact]
    public void Create_WhenRequisitionNumberIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeRequisition.Create(null!, FeRequisitionTestData.CreateUpdateModel()));

        // Assert
        Assert.Equal("requisitionNumber", exception.ParamName);
    }

    [Fact]
    public void Create_WhenModelIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeRequisition.Create(FeRequisitionTestData.RequisitionNumber, null!));

        // Assert
        Assert.Equal("model", exception.ParamName);
    }
}