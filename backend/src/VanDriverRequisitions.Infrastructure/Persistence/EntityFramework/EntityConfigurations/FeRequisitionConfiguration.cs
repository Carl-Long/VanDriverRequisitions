using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeRequisitionConfiguration : IEntityTypeConfiguration<FeRequisition>
{
    public void Configure(EntityTypeBuilder<FeRequisition> builder)
    {
        builder.ToTable("FeRequisitions");
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
        
        builder.Property(x => x.SubmittedById);
        builder.Property(x => x.SubmittedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.ProcessedById);
        builder.Property(x => x.ProcessedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.RejectedById);
        builder.Property(x => x.RejectedAtUtc).HasColumnType("datetime2");
        builder.Property(x => x.Subtotal)
            .HasPrecision(18, 2)
            .HasDefaultValue(0);

        builder.Property(x => x.IsVatApplicable)
            .IsRequired()
            .HasDefaultValue(false);
        
        builder.Property(x => x.PoNumber)
            .HasMaxLength(50);

        builder.Property(x => x.RejectionNotes)
            .HasMaxLength(1000);
        
        builder.Property(x => x.VanDriverId)
            .IsRequired();

        builder.Property(x => x.VanDriverName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.VanDriverCode)
            .IsRequired()
            .HasMaxLength(20);

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
        
        builder.Property(x => x.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();
        
        builder.HasMany(x => x.FeGeneralTasks)
            .WithOne()
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.FeMileages)
            .WithOne()
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.FeTransfers)
            .WithOne()
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.FeAdditionalCosts)
            .WithOne()
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Indexes
        builder.HasIndex(x => x.RequisitionNumber).IsUnique();
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.ShopId);
        builder.HasIndex(x => new { x.CreatedById, x.Status });
        builder.HasIndex(x => new { x.ShopId, x.Status });

        builder.ApplyAuditableConfiguration();
    }
}