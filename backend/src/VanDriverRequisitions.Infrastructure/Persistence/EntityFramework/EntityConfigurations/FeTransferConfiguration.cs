using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeTransferConfiguration : IEntityTypeConfiguration<FeTransfer>
{
    public void Configure(EntityTypeBuilder<FeTransfer> builder)
    {
        builder.ToTable("FeTransfers");

        builder.HasKey(x => x.Id);

        builder.HasOne<FeRequisition>()
            .WithMany(x => x.FeTransfers)
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.WeekEndingDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.ShopIdFrom)
            .IsRequired();

        builder.HasOne<Shop>()
            .WithMany()
            .HasForeignKey(x => x.ShopIdFrom)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.ShopIdTo)
            .IsRequired();

        builder.HasOne<Shop>()
            .WithMany()
            .HasForeignKey(x => x.ShopIdTo)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.TotalNumber)
            .IsRequired();

        builder.Property(x => x.RatePerJob)
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
        builder.HasIndex(x => x.ShopIdFrom);
        builder.HasIndex(x => x.ShopIdTo);
        builder.HasIndex(x => x.WeekEndingDate);

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_FeTransfers_TotalNumber_NonNegative",
                "[TotalNumber] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeTransfers_RatePerJob_NonNegative",
                "[RatePerJob] IS NULL OR [RatePerJob] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeTransfers_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0"
            );
        });

        builder.ApplyAuditableConfiguration();
    }
}
