using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdRequisitionConfiguration : IEntityTypeConfiguration<StdRequisition>
{
    public void Configure(EntityTypeBuilder<StdRequisition> builder)
    {
        builder.ToTable("StdRequisitions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.RequisitionNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.RequisitionDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(x => x.IsVatApplicable)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(x => x.VanDriverId)
            .IsRequired();

        builder.Property(x => x.VanDriverCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.VanDriverName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.TradersName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.ShopId)
            .IsRequired();

        builder.Property(x => x.ShopCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.ShopName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.SubmittedById);
        builder.Property(x => x.SubmittedByNameSnapshot).HasMaxLength(256);

        builder.Property(x => x.SubmittedAtUtc)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => v.HasValue
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v);

        builder.Property(x => x.ApprovedById);
        builder.Property(x => x.ApprovedByNameSnapshot).HasMaxLength(256);

        builder.Property(x => x.ApprovedAtUtc)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => v.HasValue
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v);

        builder.Property(x => x.PoNumber)
            .HasMaxLength(50);

        builder.Property(x => x.RejectedById);
        builder.Property(x => x.RejectedByNameSnapshot).HasMaxLength(256);

        builder.Property(x => x.RejectedAtUtc)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => v.HasValue
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v);

        builder.Property(x => x.RejectionNotes)
            .HasMaxLength(1000);

        builder.Property(x => x.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        builder.HasMany(x => x.Pickups)
            .WithOne()
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Pickups)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.Transfers)
            .WithOne()
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Transfers)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.CollectionChargesBanksAndBins)
            .WithOne()
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.CollectionChargesBanksAndBins)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.CollectionVanPacks)
            .WithOne()
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.CollectionVanPacks)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.AdditionalCosts)
            .WithOne()
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.AdditionalCosts)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(x => x.Submissions)
            .WithOne()
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(x => x.Submissions)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(x => x.RequisitionNumber).IsUnique();
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.ShopId);
        builder.HasIndex(x => new { x.CreatedById, x.Status });
        builder.HasIndex(x => new { x.ShopId, x.Status });

        builder.ApplyAuditableConfiguration();
    }
}