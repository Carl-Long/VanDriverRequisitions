using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.Common;

public sealed class SubmitWindowTests
{
    private static readonly DateTime OpenFrom = new(2026, 6, 13, 9, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime OpenTo = new(2026, 6, 13, 17, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_WhenOpenToIsAfterOpenFrom_CreatesSubmitWindow()
    {
        // Act
        var submitWindow = SubmitWindow.Create(OpenFrom, OpenTo);

        // Assert
        Assert.Equal(OpenFrom, submitWindow.OpenFrom);
        Assert.Equal(OpenTo, submitWindow.OpenTo);
        Assert.Null(submitWindow.DeletedAtUtc);
        Assert.Null(submitWindow.DeletedById);
        Assert.Null(submitWindow.DeletedByNameSnapshot);
    }

    [Fact]
    public void Update_WhenOpenToIsAfterOpenFrom_UpdatesSubmitWindow()
    {
        // Arrange
        var submitWindow = SubmitWindow.Create(OpenFrom, OpenTo);

        var newOpenFrom = new DateTime(2026, 6, 14, 9, 0, 0, DateTimeKind.Utc);
        var newOpenTo = new DateTime(2026, 6, 14, 17, 0, 0, DateTimeKind.Utc);

        // Act
        submitWindow.Update(newOpenFrom, newOpenTo);

        // Assert
        Assert.Equal(newOpenFrom, submitWindow.OpenFrom);
        Assert.Equal(newOpenTo, submitWindow.OpenTo);
    }

    [Fact]
    public void Create_WhenOpenToEqualsOpenFrom_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => SubmitWindow.Create(OpenFrom, OpenFrom));
    }

    [Fact]
    public void Create_WhenOpenToIsBeforeOpenFrom_ThrowsInvalidOperationException()
    {
        // Arrange
        var openTo = OpenFrom.AddMinutes(-1);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => SubmitWindow.Create(OpenFrom, openTo));
    }

    [Fact]
    public void Update_WhenOpenToEqualsOpenFrom_ThrowsInvalidOperationException()
    {
        // Arrange
        var submitWindow = SubmitWindow.Create(OpenFrom, OpenTo);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => submitWindow.Update(OpenFrom, OpenFrom));
    }

    [Fact]
    public void Update_WhenOpenToIsBeforeOpenFrom_ThrowsInvalidOperationException()
    {
        // Arrange
        var submitWindow = SubmitWindow.Create(OpenFrom, OpenTo);
        var openTo = OpenFrom.AddMinutes(-1);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => submitWindow.Update(OpenFrom, openTo));
    }
    
    [Fact]
    public void Create_WhenOpenFromIsDefault_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => SubmitWindow.Create(default, OpenTo));
    }

    [Fact]
    public void Create_WhenOpenToIsDefault_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => SubmitWindow.Create(OpenFrom, default));
    }

    [Theory]
    [InlineData(DateTimeKind.Local)]
    [InlineData(DateTimeKind.Unspecified)]
    public void Create_WhenOpenFromIsNotUtc_ThrowsInvalidOperationException(DateTimeKind kind)
    {
        // Arrange
        var openFrom = new DateTime(2026, 6, 13, 9, 0, 0, kind);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => SubmitWindow.Create(openFrom, OpenTo));
    }

    [Theory]
    [InlineData(DateTimeKind.Local)]
    [InlineData(DateTimeKind.Unspecified)]
    public void Create_WhenOpenToIsNotUtc_ThrowsInvalidOperationException(DateTimeKind kind)
    {
        // Arrange
        var openTo = new DateTime(2026, 6, 13, 17, 0, 0, kind);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => SubmitWindow.Create(OpenFrom, openTo));
    }
}