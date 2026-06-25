using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdCollectionVanPackConfiguration : IEntityTypeConfiguration<StdCollectionVanPack>
{
    public void Configure(EntityTypeBuilder<StdCollectionVanPack> builder)
    {
        builder.ToTable("StdCollectionVanPacks");

        builder.HasKey(x => x.Id);

        builder.HasOne<StdRequisition>()
            .WithMany(x => x.CollectionVanPacks)
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.DeliveryDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.PostCodeZone)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.VanPacksOut)
            .IsRequired();

        builder.Property(x => x.FilledBags)
            .IsRequired();

        builder.Property(x => x.RatePerVanPack)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalValue)
            .HasPrecision(18, 2);

        builder.Ignore(x => x.UnusedVanPacks);
        builder.Ignore(x => x.PercentReturned);

        builder.HasIndex(x => x.StdRequisitionId);
        builder.HasIndex(x => x.DeliveryDate);
        builder.HasIndex(x => x.PostCodeZone);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_StdCollectionVanPacks_VanPacksOut_Positive",
                "[VanPacksOut] >= 1");

            t.HasCheckConstraint(
                "CK_StdCollectionVanPacks_FilledBags_Positive",
                "[FilledBags] >= 1");

            t.HasCheckConstraint(
                "CK_StdCollectionVanPacks_FilledBags_NotGreaterThanVanPacksOut",
                "[FilledBags] <= [VanPacksOut]");

            t.HasCheckConstraint(
                "CK_StdCollectionVanPacks_RatePerVanPack_Minimum",
                "[RatePerVanPack] >= 0.01");

            t.HasCheckConstraint(
                "CK_StdCollectionVanPacks_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0");
        });

        builder.ApplyAuditableConfiguration();
    }
}