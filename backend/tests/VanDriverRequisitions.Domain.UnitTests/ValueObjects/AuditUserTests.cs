using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.UnitTests.ValueObjects;

public sealed class AuditUserTests
{
    [Fact]
    public void Constructor_WhenValid_SetsProperties()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var auditUser = new AuditUser(id, "Jane Smith");

        // Assert
        Assert.Equal(id, auditUser.Id);
        Assert.Equal("Jane Smith", auditUser.NameSnapshot);
    }

    [Fact]
    public void Constructor_WhenIdIsEmpty_ThrowsArgumentException()
    {
        // Act / Assert
        Assert.Throws<ArgumentException>(() => new AuditUser(Guid.Empty, "Jane Smith"));
    }

    [Fact]
    public void Constructor_WhenNameSnapshotIsNull_ThrowsArgumentException()
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() => new AuditUser(Guid.NewGuid(), null!));
    }

    [Fact]
    public void Constructor_WhenNameSnapshotIsEmpty_ThrowsArgumentException()
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() => new AuditUser(Guid.NewGuid(), string.Empty));
    }

    [Fact]
    public void Constructor_WhenNameSnapshotIsWhitespace_ThrowsArgumentException()
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() => new AuditUser(Guid.NewGuid(), "   "));
    }
}