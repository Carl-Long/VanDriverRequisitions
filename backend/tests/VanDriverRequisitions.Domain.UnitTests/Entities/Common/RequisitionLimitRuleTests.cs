using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.Common;

public sealed class RequisitionLimitRuleTests
{
    private static readonly Guid TaskTypeId = new("11111111-1111-1111-1111-111111111111");
    private static readonly Guid OtherTaskTypeId = new("22222222-2222-2222-2222-222222222222");

    [Fact]
    public void Create_WhenGeneralTaskHasTaskType_CreatesRule()
    {
        // Arrange
        var details = CreateGeneralTaskDetails();

        // Act
        var rule = RequisitionLimitRule.Create(details);

        // Assert
        Assert.Equal(RequisitionRowCategory.GeneralTask, rule.Category);
        Assert.Equal(TaskTypeId, rule.FeTaskTypeId);
        Assert.Equal(Fascia.Fe, rule.Fascia);
        Assert.Equal(30, rule.MaxQuantity);
        Assert.Equal(15.00m, rule.MaxRate);
    }

    [Theory]
    [InlineData(RequisitionRowCategory.Mileage)]
    [InlineData(RequisitionRowCategory.Transfer)]
    [InlineData(RequisitionRowCategory.AdditionalCost)]
    public void Create_WhenNonGeneralTaskHasNoTaskType_CreatesRule(RequisitionRowCategory category)
    {
        // Arrange
        var details = CreateDetails(category: category, feTaskTypeId: null);

        // Act
        var rule = RequisitionLimitRule.Create(details);

        // Assert
        Assert.Equal(category, rule.Category);
        Assert.Null(rule.FeTaskTypeId);
        Assert.Equal(Fascia.Fe, rule.Fascia);
        Assert.Equal(30, rule.MaxQuantity);
        Assert.Equal(15.00m, rule.MaxRate);
    }

    [Fact]
    public void Update_WhenValid_UpdatesRule()
    {
        // Arrange
        var rule = RequisitionLimitRule.Create(CreateGeneralTaskDetails());

        var updateDetails = CreateDetails(
            category: RequisitionRowCategory.Mileage,
            feTaskTypeId: null,
            maxQuantity: 300,
            maxRate: 0.50m);

        // Act
        rule.Update(updateDetails);

        // Assert
        Assert.Equal(RequisitionRowCategory.Mileage, rule.Category);
        Assert.Null(rule.FeTaskTypeId);
        Assert.Equal(Fascia.Fe, rule.Fascia);
        Assert.Equal(300, rule.MaxQuantity);
        Assert.Equal(0.50m, rule.MaxRate);
    }

    [Fact]
    public void Create_WhenDetailsIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => RequisitionLimitRule.Create(null!));

        // Assert
        Assert.Equal("details", exception.ParamName);
    }

    [Fact]
    public void Update_WhenDetailsIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var rule = RequisitionLimitRule.Create(CreateGeneralTaskDetails());

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() => rule.Update(null!));

        // Assert
        Assert.Equal("details", exception.ParamName);
    }

    [Fact]
    public void Create_WhenMaxQuantityIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var details = CreateGeneralTaskDetails(maxQuantity: -1);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => RequisitionLimitRule.Create(details));
    }

    [Fact]
    public void Create_WhenMaxRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var details = CreateGeneralTaskDetails(maxRate: -0.01m);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => RequisitionLimitRule.Create(details));
    }

    [Fact]
    public void Create_WhenGeneralTaskHasNoTaskType_ThrowsInvalidOperationException()
    {
        // Arrange
        var details = CreateDetails(category: RequisitionRowCategory.GeneralTask, feTaskTypeId: null);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => RequisitionLimitRule.Create(details));
    }

    [Theory]
    [InlineData(RequisitionRowCategory.Mileage)]
    [InlineData(RequisitionRowCategory.Transfer)]
    [InlineData(RequisitionRowCategory.AdditionalCost)]
    public void Create_WhenNonGeneralTaskHasTaskType_ThrowsInvalidOperationException(RequisitionRowCategory category)
    {
        // Arrange
        var details = CreateDetails(category: category, feTaskTypeId: OtherTaskTypeId);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => RequisitionLimitRule.Create(details));
    }

    [Fact]
    public void Update_WhenMaxQuantityIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var rule = RequisitionLimitRule.Create(CreateGeneralTaskDetails());

        var details = CreateGeneralTaskDetails(maxQuantity: -1);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            rule.Update(details));
    }

    [Fact]
    public void Update_WhenMaxRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var rule = RequisitionLimitRule.Create(CreateGeneralTaskDetails());

        var details = CreateGeneralTaskDetails(maxRate: -0.01m);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => rule.Update(details));
    }

    [Fact]
    public void Update_WhenGeneralTaskHasNoTaskType_ThrowsInvalidOperationException()
    {
        // Arrange
        var rule = RequisitionLimitRule.Create(CreateGeneralTaskDetails());

        var details = CreateDetails(category: RequisitionRowCategory.GeneralTask, feTaskTypeId: null);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => rule.Update(details));
    }

    [Theory]
    [InlineData(RequisitionRowCategory.Mileage)]
    [InlineData(RequisitionRowCategory.Transfer)]
    [InlineData(RequisitionRowCategory.AdditionalCost)]
    public void Update_WhenNonGeneralTaskHasTaskType_ThrowsInvalidOperationException(
        RequisitionRowCategory category)
    {
        // Arrange
        var rule = RequisitionLimitRule.Create(CreateGeneralTaskDetails());

        var details = CreateDetails(category: category, feTaskTypeId: OtherTaskTypeId);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => rule.Update(details));
    }

    private static RequisitionLimitRuleDetails CreateGeneralTaskDetails(int maxQuantity = 30, decimal maxRate = 15.00m)
    {
        return CreateDetails(
            category: RequisitionRowCategory.GeneralTask,
            feTaskTypeId: TaskTypeId,
            maxQuantity: maxQuantity,
            maxRate: maxRate);
    }

    private static RequisitionLimitRuleDetails CreateDetails(
        RequisitionRowCategory category,
        Guid? feTaskTypeId,
        int maxQuantity = 30,
        decimal maxRate = 15.00m)
    {
        return new RequisitionLimitRuleDetails(
            category,
            feTaskTypeId,
            Fascia.Fe,
            maxQuantity,
            maxRate);
    }
}