using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeMileageConfiguration : IEntityTypeConfiguration<FeMileage>
{
    public void Configure(EntityTypeBuilder<FeMileage> builder)
    {
        builder.ToTable("FeMileages");

        builder.HasKey(x => x.Id);

        builder.HasOne<FeRequisition>()
            .WithMany(x => x.FeMileages)
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.WeekEndingDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.TotalMiles)
            .HasDefaultValue(0);

        builder.Property(x => x.RatePerMile)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalValue)
            .HasPrecision(18, 2);

        builder.OwnsOne(x => x.Week, week =>
        {
            week.Property(x => x.Sunday).HasColumnName("Sun");
            week.Property(x => x.Monday).HasColumnName("Mon");
            week.Property(x => x.Tuesday).HasColumnName("Tue");
            week.Property(x => x.Wednesday).HasColumnName("Wed");
            week.Property(x => x.Thursday).HasColumnName("Thu");
            week.Property(x => x.Friday).HasColumnName("Fri");
            week.Property(x => x.Saturday).HasColumnName("Sat");
        });

        // Indexes
        builder.HasIndex(x => x.FeRequisitionId);
        builder.HasIndex(x => x.WeekEndingDate);

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_FeMileages_TotalMiles_NonNegative",
                "[TotalMiles] IS NULL OR [TotalMiles] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeMileages_RatePerMile_NonNegative",
                "[RatePerMile] IS NULL OR [RatePerMile] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeMileages_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0"
            );
        });

        builder.ApplyAuditableConfiguration();
    }
}
