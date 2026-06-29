using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.Common;

public sealed class CostReasonTests
{
    [Theory]
    [InlineData(CostReasonScope.Fe, true)]
    [InlineData(CostReasonScope.Shared, true)]
    [InlineData(CostReasonScope.Std, false)]
    public void AppliesToFe_ReturnsExpectedResult(CostReasonScope scope, bool expected)
    {
        // Arrange
        var reason = new CostReason
        {
            Code = "1001",
            Reason = "Test reason",
            Scope = scope
        };

        // Act
        var result = reason.AppliesToFe();

        // Assert
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(CostReasonScope.Std, true)]
    [InlineData(CostReasonScope.Shared, true)]
    [InlineData(CostReasonScope.Fe, false)]
    public void AppliesToStd_ReturnsExpectedResult(CostReasonScope scope, bool expected)
    {
        // Arrange
        var reason = new CostReason
        {
            Code = "1001",
            Reason = "Test reason",
            Scope = scope
        };

        // Act
        var result = reason.AppliesToStd();

        // Assert
        Assert.Equal(expected, result);
    }
}