using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class VanDriverConfiguration : IEntityTypeConfiguration<VanDriver>
{
    public void Configure(EntityTypeBuilder<VanDriver> builder)
    {
        builder.ToTable("VanDrivers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(x => x.TradersName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Address1)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.Address2)
            .HasMaxLength(150);

        builder.Property(x => x.Town)
            .HasMaxLength(100);

        builder.Property(x => x.County)
            .HasMaxLength(100);

        builder.Property(x => x.Postcode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.Phone)
            .HasMaxLength(20);

        builder.Property(x => x.VatNumber)
            .HasMaxLength(20);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(x => x.Code).IsUnique();
        builder.HasIndex(x => x.TradersName);
        builder.HasIndex(x => x.IsActive);
    }
}
