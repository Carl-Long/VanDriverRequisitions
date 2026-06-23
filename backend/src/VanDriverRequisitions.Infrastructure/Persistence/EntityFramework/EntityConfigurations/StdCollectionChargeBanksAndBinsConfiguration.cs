using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdCollectionChargeBanksAndBinsConfiguration : IEntityTypeConfiguration<StdCollectionChargeBanksAndBins>
{
    public void Configure(EntityTypeBuilder<StdCollectionChargeBanksAndBins> builder)
    {
        builder.ToTable("StdCollectionChargesBanksAndBins");

        builder.HasKey(x => x.Id);

        builder.HasOne<StdRequisition>()
            .WithMany(x => x.CollectionChargesBanksAndBins)
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Date)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.CollectionTypeId)
            .IsRequired();

        builder.Property(x => x.CollectionTypeNameSnapshot)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.CollectionTypeCodeSnapshot)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne<StdCollectionType>()
            .WithMany()
            .HasForeignKey(x => x.CollectionTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.LocationId)
            .IsRequired();

        builder.Property(x => x.LocationNameSnapshot)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.LocationPostCodeSnapshot)
            .IsRequired()
            .HasMaxLength(10);

        builder.HasOne<StdLocation>()
            .WithMany()
            .HasForeignKey(x => x.LocationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.NumberOfBags);

        builder.Property(x => x.ChargeType)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Miles);

        builder.Property(x => x.RatePerMile)
            .HasPrecision(18, 2);

        builder.Property(x => x.FlatCharge)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalValue)
            .HasPrecision(18, 2);

        builder.HasIndex(x => x.StdRequisitionId);
        builder.HasIndex(x => x.CollectionTypeId);
        builder.HasIndex(x => x.LocationId);
        builder.HasIndex(x => x.Date);
        builder.HasIndex(x => x.ChargeType);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_StdCollectionChargesBanksAndBins_NumberOfBags_NonNegative",
                "[NumberOfBags] IS NULL OR [NumberOfBags] >= 0");

            t.HasCheckConstraint(
                "CK_StdCollectionChargesBanksAndBins_Miles_NonNegative",
                "[Miles] IS NULL OR [Miles] >= 0");

            t.HasCheckConstraint(
                "CK_StdCollectionChargesBanksAndBins_RatePerMile_NonNegative",
                "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            t.HasCheckConstraint(
                "CK_StdCollectionChargesBanksAndBins_FlatCharge_NonNegative",
                "[FlatCharge] IS NULL OR [FlatCharge] >= 0");

            t.HasCheckConstraint(
                "CK_StdCollectionChargesBanksAndBins_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0");

            t.HasCheckConstraint(
                "CK_StdCollectionChargesBanksAndBins_ChargeShape",
                "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR " +
                "([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
        });

        builder.ApplyAuditableConfiguration();
    }
}