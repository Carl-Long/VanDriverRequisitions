using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;

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

        builder.Property(x => x.FeTaskTypeId)
            .IsRequired(false);

        builder.Property(x => x.Fascia)
            .IsRequired()
            .HasConversion<int>();
        
        builder.Property(x => x.MaxQuantity)
            .IsRequired();

        builder.Property(x => x.MaxRate)
            .IsRequired()
            .HasPrecision(18, 2);
        
        builder.HasOne(x => x.FeTaskType)
            .WithMany()
            .HasForeignKey(x => x.FeTaskTypeId)
            .OnDelete(DeleteBehavior.SetNull);
        
        builder.HasIndex(x => new
            {
                x.Category,
                x.FeTaskTypeId,
                x.Fascia
            })
            .IsUnique();
        
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_RequisitionLimitRules_MaxQuantity_Positive",
                "[MaxQuantity] > 0"
            );

            t.HasCheckConstraint(
                "CK_RequisitionLimitRules_MaxRate_Positive",
                "[MaxRate] > 0"
            );
        });

        builder.ApplyAuditableConfiguration();
    }
}