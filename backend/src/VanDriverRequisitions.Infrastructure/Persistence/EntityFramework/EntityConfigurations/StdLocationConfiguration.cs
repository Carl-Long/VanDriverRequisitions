using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdLocationConfiguration : IEntityTypeConfiguration<StdLocation>
{
    public void Configure(EntityTypeBuilder<StdLocation> builder)
    {
        builder.ToTable("StdLocations");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CollectionTypeId)
            .IsRequired();

        builder.HasOne<StdCollectionType>()
            .WithMany()
            .HasForeignKey(x => x.CollectionTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.ShopId)
            .IsRequired();

        builder.HasOne<Shop>()
            .WithMany()
            .HasForeignKey(x => x.ShopId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.LocationName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(x => x.PostCode)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(x => x.CollectionTypeId);
        builder.HasIndex(x => x.ShopId);
        builder.HasIndex(x => x.LocationName);
        builder.HasIndex(x => x.PostCode);
        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => new { x.ShopId, x.CollectionTypeId, x.IsActive });

        builder.ApplyAuditableConfiguration();
    }
}