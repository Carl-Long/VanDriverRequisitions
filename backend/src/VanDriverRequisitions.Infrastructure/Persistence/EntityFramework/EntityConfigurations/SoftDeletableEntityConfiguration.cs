using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public static class SoftDeletableEntityConfiguration
{
    public static void ApplySoftDeleteConfiguration<T>(this EntityTypeBuilder<T> builder)
        where T : class, ISoftDeletable
    {
        builder.Property(x => x.DeletedAtUtc)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => v.HasValue 
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v);
        
        builder.Property(x => x.DeletedById);
        builder.Property(x => x.DeletedByNameSnapshot)
            .HasMaxLength(256);
    }
}