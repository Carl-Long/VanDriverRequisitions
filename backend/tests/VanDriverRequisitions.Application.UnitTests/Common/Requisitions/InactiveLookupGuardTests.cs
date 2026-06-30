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
        Assert.Equal("Van driver 'VD001 - Test Driver' is inactive and cannot be used for a new requisition.",
            exception.Message);
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
        Assert.Equal("Shop 'S001 - Test Shop' is inactive and cannot be used for a new requisition.",
            exception.Message);
    }

    [Fact]
    public void EnsureActiveOrUnchangedForExistingLookup_WhenIncomingLookupIsActive_DoesNotThrow()
    {
        // Arrange
        var existingLookupId = Guid.NewGuid();
        var incomingLookupId = Guid.NewGuid();

        // Act
        var exception = Record.Exception(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingLookup(
                existingLookupId,
                incomingLookupId,
                incomingLookupIsActive: true,
                "Shop 'S001 - Test Shop'"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public void EnsureActiveOrUnchangedForExistingLookup_WhenIncomingLookupIsInactiveButUnchanged_DoesNotThrow()
    {
        // Arrange
        var lookupId = Guid.NewGuid();

        // Act
        var exception = Record.Exception(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingLookup(
                lookupId,
                lookupId,
                incomingLookupIsActive: false,
                "Shop 'S001 - Test Shop'"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public void
        EnsureActiveOrUnchangedForExistingLookup_WhenIncomingLookupIsInactiveAndChanged_ThrowsBadRequestException()
    {
        // Arrange
        var existingLookupId = Guid.NewGuid();
        var incomingLookupId = Guid.NewGuid();

        // Act
        var exception = Assert.Throws<BadRequestException>(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingLookup(
                existingLookupId,
                incomingLookupId,
                incomingLookupIsActive: false,
                "Shop 'S002 - Inactive Shop'"));

        // Assert
        Assert.Equal("Shop 'S002 - Inactive Shop' is inactive and cannot be selected.", exception.Message);
    }

    [Fact]
    public void EnsureActiveOrUnchangedForExistingChildLookup_WhenIncomingLookupIsActive_DoesNotThrow()
    {
        // Arrange
        var rowId = Guid.NewGuid();
        var existingLookupId = Guid.NewGuid();
        var incomingLookupId = Guid.NewGuid();

        var existingLookupIdByRowId = new Dictionary<Guid, Guid>
        {
            [rowId] = existingLookupId,
        };

        // Act
        var exception = Record.Exception(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                rowId,
                incomingLookupId,
                incomingLookupIsActive: true,
                existingLookupIdByRowId,
                "Cost reason '10001 - Parking'"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public void EnsureActiveOrUnchangedForExistingChildLookup_WhenIncomingLookupIsInactiveButUnchanged_DoesNotThrow()
    {
        // Arrange
        var rowId = Guid.NewGuid();
        var lookupId = Guid.NewGuid();

        var existingLookupIdByRowId = new Dictionary<Guid, Guid>
        {
            [rowId] = lookupId,
        };

        // Act
        var exception = Record.Exception(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                rowId,
                lookupId,
                incomingLookupIsActive: false,
                existingLookupIdByRowId,
                "Cost reason '10001 - Parking'"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public void
        EnsureActiveOrUnchangedForExistingChildLookup_WhenIncomingLookupIsInactiveAndChanged_ThrowsBadRequestException()
    {
        // Arrange
        var rowId = Guid.NewGuid();
        var existingLookupId = Guid.NewGuid();
        var incomingLookupId = Guid.NewGuid();

        var existingLookupIdByRowId = new Dictionary<Guid, Guid>
        {
            [rowId] = existingLookupId,
        };

        // Act
        var exception = Assert.Throws<BadRequestException>(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                rowId,
                incomingLookupId,
                incomingLookupIsActive: false,
                existingLookupIdByRowId,
                "Cost reason '10002 - Inactive Reason'"));

        // Assert
        Assert.Equal(
            "Cost reason '10002 - Inactive Reason' is inactive and cannot be selected.",
            exception.Message);
    }

    [Fact]
    public void
        EnsureActiveOrUnchangedForExistingChildLookup_WhenIncomingLookupIsInactiveAndRowIsNew_ThrowsBadRequestException()
    {
        // Arrange
        var incomingLookupId = Guid.NewGuid();

        // Act
        var exception = Assert.Throws<BadRequestException>(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                incomingRowId: null,
                incomingLookupId,
                incomingLookupIsActive: false,
                existingLookupIdByRowId: new Dictionary<Guid, Guid>(),
                "Cost reason '10002 - Inactive Reason'"));

        // Assert
        Assert.Equal(
            "Cost reason '10002 - Inactive Reason' is inactive and cannot be selected.",
            exception.Message);
    }

    [Fact]
    public void
        EnsureActiveOrUnchangedForExistingChildLookup_WhenIncomingLookupIsInactiveAndRowIdIsUnknown_ThrowsBadRequestException()
    {
        // Arrange
        var incomingRowId = Guid.NewGuid();
        var incomingLookupId = Guid.NewGuid();

        // Act
        var exception = Assert.Throws<BadRequestException>(() =>
            InactiveLookupGuard.EnsureActiveOrUnchangedForExistingChildLookup(
                incomingRowId,
                incomingLookupId,
                incomingLookupIsActive: false,
                existingLookupIdByRowId: new Dictionary<Guid, Guid>(),
                "Cost reason '10002 - Inactive Reason'"));

        // Assert
        Assert.Equal("Cost reason '10002 - Inactive Reason' is inactive and cannot be selected.", exception.Message);
    }
}