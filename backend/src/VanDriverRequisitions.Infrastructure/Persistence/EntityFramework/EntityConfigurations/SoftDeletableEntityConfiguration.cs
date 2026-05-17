using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public static class SoftDeletableEntityConfiguration
{
    public static void ApplySoftDeleteConfiguration<T>(this EntityTypeBuilder<T> builder)
        where T : class, ISoftDeletable
    {
        builder.Property(x => x.DeletedAtUtc);
        builder.Property(x => x.DeletedById);
        builder.Property(x => x.DeletedByNameSnapshot)
            .HasMaxLength(256);
    }
}