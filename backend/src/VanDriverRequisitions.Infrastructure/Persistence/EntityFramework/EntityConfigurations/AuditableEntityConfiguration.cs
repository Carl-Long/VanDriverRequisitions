using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities;
using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public static class AuditableEntityConfiguration
{
    public static void ApplyAuditableConfiguration<T>(this EntityTypeBuilder<T> builder)
        where T : AuditableEntity
    {
        builder.Property(x => x.CreatedById)
            .IsRequired();

        builder.Property(x => x.CreatedByNameSnapshot)
            .HasMaxLength(256);

        builder.Property(x => x.UpdatedByNameSnapshot)
            .HasMaxLength(256);

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.Property(x => x.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();
    }
}