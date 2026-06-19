using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdTransferConfiguration : IEntityTypeConfiguration<StdTransfer>
{
    public void Configure(EntityTypeBuilder<StdTransfer> builder)
    {
        builder.ToTable("StdTransfers");

        builder.HasKey(x => x.Id);

        builder.HasOne<StdRequisition>()
            .WithMany(x => x.Transfers)
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.Date)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.ShopIdFrom)
            .IsRequired();

        builder.Property(x => x.ShopCodeFrom)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ShopNameFrom)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasOne<Shop>()
            .WithMany()
            .HasForeignKey(x => x.ShopIdFrom)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.ShopIdTo)
            .IsRequired();

        builder.Property(x => x.ShopCodeTo)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ShopNameTo)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasOne<Shop>()
            .WithMany()
            .HasForeignKey(x => x.ShopIdTo)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.NumberOfBags);

        builder.Property(x => x.NumberOfBoxes);

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
        builder.HasIndex(x => x.ShopIdFrom);
        builder.HasIndex(x => x.ShopIdTo);
        builder.HasIndex(x => x.Date);
        builder.HasIndex(x => x.ChargeType);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_StdTransfers_DifferentShops",
                "[ShopIdFrom] <> [ShopIdTo]");

            t.HasCheckConstraint(
                "CK_StdTransfers_NumberOfBags_NonNegative",
                "[NumberOfBags] IS NULL OR [NumberOfBags] >= 0");

            t.HasCheckConstraint(
                "CK_StdTransfers_NumberOfBoxes_NonNegative",
                "[NumberOfBoxes] IS NULL OR [NumberOfBoxes] >= 0");

            t.HasCheckConstraint(
                "CK_StdTransfers_Miles_NonNegative",
                "[Miles] IS NULL OR [Miles] >= 0");

            t.HasCheckConstraint(
                "CK_StdTransfers_RatePerMile_NonNegative",
                "[RatePerMile] IS NULL OR [RatePerMile] >= 0");

            t.HasCheckConstraint(
                "CK_StdTransfers_FlatCharge_NonNegative",
                "[FlatCharge] IS NULL OR [FlatCharge] >= 0");

            t.HasCheckConstraint(
                "CK_StdTransfers_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0");

            t.HasCheckConstraint(
                "CK_StdTransfers_ChargeShape",
                "([ChargeType] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [FlatCharge] IS NULL) OR " +
                "([ChargeType] = 1 AND [FlatCharge] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
        });

        builder.ApplyAuditableConfiguration();
    }
}