using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdPickupConfiguration : IEntityTypeConfiguration<StdPickup>
{
    public void Configure(EntityTypeBuilder<StdPickup> builder)
    {
        builder.ToTable("StdPickups");

        builder.HasKey(x => x.Id);

        builder.HasOne<StdRequisition>()
            .WithMany(x => x.Pickups)
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Date)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.NumberOfBags)
            .IsRequired();

        builder.Property(x => x.NumberOfHouseholds)
            .IsRequired();

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
        builder.HasIndex(x => x.Date);
        builder.HasIndex(x => x.ChargeType);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_StdPickups_NumberOfBags_Positive",
                "[NumberOfBags] >= 1");

            t.HasCheckConstraint(
                "CK_StdPickups_NumberOfHouseholds_Positive",
                "[NumberOfHouseholds] >= 1");

            t.HasCheckConstraint(
                "CK_StdPickups_Miles_Positive",
                "[Miles] IS NULL OR [Miles] >= 1");
            
            t.HasCheckConstraint(
                "CK_StdPickups_RatePerMile_Minimum",
                "[RatePerMile] IS NULL OR [RatePerMile] >= 0.01");

            t.HasCheckConstraint(
                "CK_StdPickups_FlatCharge_Minimum",
                "[FlatCharge] IS NULL OR [FlatCharge] >= 0.01");

            t.HasCheckConstraint(
                "CK_StdPickups_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0");

            t.HasCheckConstraint(
                "CK_StdPickups_ChargeShape",
                "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR " +
                "([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
        });

        builder.ApplyAuditableConfiguration();
    }
}