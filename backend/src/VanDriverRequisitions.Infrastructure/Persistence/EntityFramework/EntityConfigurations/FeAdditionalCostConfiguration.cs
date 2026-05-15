using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeAdditionalCostConfiguration : IEntityTypeConfiguration<FeAdditionalCost>
{
    public void Configure(EntityTypeBuilder<FeAdditionalCost> builder)
    {
        builder.ToTable("FeAdditionalCosts");

        builder.HasKey(x => x.Id);

        builder.HasOne<FeRequisition>()
            .WithMany(x => x.FeAdditionalCosts)
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.WeekEndingDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.Miles);

        builder.Property(x => x.RatePerMile)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalNumber);

        builder.Property(x => x.RatePerJob)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalValue)
            .HasPrecision(18, 2);

        builder.Property(x => x.ChargingOption)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.ReasonId)
            .IsRequired();

        builder.HasOne(x => x.FeReason)
            .WithMany()
            .HasForeignKey(x => x.ReasonId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => x.FeRequisitionId);
        builder.HasIndex(x => x.ReasonId);
        builder.HasIndex(x => x.WeekEndingDate);
        builder.HasIndex(x => x.ChargingOption);

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_FeAdditionalCosts_Miles_NonNegative",
                "[Miles] IS NULL OR [Miles] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeAdditionalCosts_RatePerMile_NonNegative",
                "[RatePerMile] IS NULL OR [RatePerMile] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeAdditionalCosts_TotalNumber_NonNegative",
                "[TotalNumber] IS NULL OR [TotalNumber] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeAdditionalCosts_RatePerJob_NonNegative",
                "[RatePerJob] IS NULL OR [RatePerJob] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeAdditionalCosts_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeAdditionalCosts_MutuallyExclusive",
                "([ChargingOption] = 0 AND [Miles] IS NOT NULL AND [TotalNumber] IS NULL) OR ([ChargingOption] = 1 AND [TotalNumber] IS NOT NULL AND [Miles] IS NULL)"
            );
        });

        builder.Apply();
    }
}
