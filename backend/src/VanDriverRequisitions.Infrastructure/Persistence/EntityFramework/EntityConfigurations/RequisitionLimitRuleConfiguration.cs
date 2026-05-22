using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class RequisitionLimitRuleConfiguration
    : IEntityTypeConfiguration<RequisitionLimitRule>
{
    public void Configure(EntityTypeBuilder<RequisitionLimitRule> builder)
    {
        builder.ToTable("RequisitionLimitRules");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Category)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Fascia)
            .HasConversion<int?>();

        builder.Property(x => x.MaxQuantity);

        builder.Property(x => x.MaxRate)
            .HasPrecision(18, 2);

        // Relationships
        builder.HasOne(x => x.FeTaskType)
            .WithMany()
            .HasForeignKey(x => x.FeTaskTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.FeTaskTypeId);
        builder.HasIndex(x => new
        {
            x.Category,
            x.FeTaskTypeId,
            x.Fascia
        });

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_RequisitionLimitRules_MaxQuantity_NonNegative",
                "[MaxQuantity] IS NULL OR [MaxQuantity] >= 0"
            );

            t.HasCheckConstraint(
                "CK_RequisitionLimitRules_MaxRate_NonNegative",
                "[MaxRate] IS NULL OR [MaxRate] >= 0"
            );
        });

        builder.ApplyAuditableConfiguration();
    }
}