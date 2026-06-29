using VanDriverRequisitions.Application.Common.Requisitions;
using VanDriverRequisitions.Application.Exceptions;

namespace VanDriverRequisitions.Application.UnitTests.Common.Requisitions;

public sealed class InactiveLookupGuardTests
{
    [Fact]
    public void EnsureActiveForNewRequisition_WhenLookupIsActive_DoesNotThrow()
    {
        // Act
        var exception = Record.Exception(() =>
            InactiveLookupGuard.EnsureActiveForNewRequisition(
                isActive: true,
                lookupDescription: "Van driver 'VD001 - Test Driver'"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public void EnsureActiveForNewRequisition_WhenLookupIsInactive_ThrowsBadRequestException()
    {
        // Act
        var exception = Assert.Throws<BadRequestException>(() =>
            InactiveLookupGuard.EnsureActiveForNewRequisition(
                isActive: false,
                lookupDescription: "Van driver 'VD001 - Test Driver'"));

        // Assert
        Assert.Equal("Van driver 'VD001 - Test Driver' is inactive and cannot be used for a new requisition.", exception.Message);
    }

    [Fact]
    public void EnsureActiveForNewRequisition_WhenShopIsInactive_UsesProvidedLookupDescription()
    {
        // Act
        var exception = Assert.Throws<BadRequestException>(() =>
            InactiveLookupGuard.EnsureActiveForNewRequisition(
                isActive: false,
                lookupDescription: "Shop 'S001 - Test Shop'"));

        // Assert
        Assert.Equal("Shop 'S001 - Test Shop' is inactive and cannot be used for a new requisition.", exception.Message);
    }
}