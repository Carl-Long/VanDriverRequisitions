using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeReasonConfiguration : IEntityTypeConfiguration<FeReason>
{
    public void Configure(EntityTypeBuilder<FeReason> builder)
    {
        builder.ToTable("FeReasons");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Reason)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(x => x.Reason).IsUnique();

        builder.ApplyAuditableConfiguration();
    }
}
