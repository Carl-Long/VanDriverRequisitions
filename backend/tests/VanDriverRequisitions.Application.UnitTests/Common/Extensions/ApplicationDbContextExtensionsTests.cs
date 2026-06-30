using Moq;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Application.UnitTests.Common.Extensions;

public sealed class ApplicationDbContextExtensionsTests
{
    public static IEnumerable<object?[]> MissingRowVersions()
    {
        yield return [null];
        yield return [Array.Empty<byte>()];
    }

    [Theory]
    [MemberData(nameof(MissingRowVersions))]
    public void SetOriginalRowVersion_WhenRowVersionIsMissingOrEmpty_ThrowsBadRequestException(
        byte[]? rowVersion)
    {
        // Arrange
        var context = new Mock<IApplicationDbContext>();
        var entity = new TestConcurrencyAwareEntity();

        // Act
        var exception = Assert.Throws<BadRequestException>(() => context.Object.SetRequiredOriginalRowVersion(entity, rowVersion));

        // Assert
        Assert.Equal("RowVersion is required for this operation.", exception.Message);

        context.Verify(x => x.Entry(It.IsAny<object>()), Times.Never);
    }

    private sealed class TestConcurrencyAwareEntity : ConcurrencyAwareEntity;
}