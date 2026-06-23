using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class CostReasonConfiguration : IEntityTypeConfiguration<CostReason>
{
    public void Configure(EntityTypeBuilder<CostReason> builder)
    {
        builder.ToTable("CostReasons");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.Reason)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Scope)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => x.Reason);
        builder.HasIndex(x => x.Scope);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => new { x.Scope, x.IsActive });

        builder.ApplyAuditableConfiguration();
    }
}