using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class LimitValueConfiguration : IEntityTypeConfiguration<LimitValue>
{
    public void Configure(EntityTypeBuilder<LimitValue> builder)
    {
        builder.ToTable("LimitValues");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.NameOfValue)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Fascia)
            .HasConversion<int?>();

        builder.Property(x => x.TypeOfLimitation)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.NumericalLimit);

        builder.Property(x => x.CurrencyLimit)
            .HasPrecision(18, 2);

        // Indexes
        builder.HasIndex(x => x.Title).IsUnique();
        builder.HasIndex(x => x.TypeOfLimitation);
        builder.HasIndex(x => x.Fascia);

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_LimitValues_OneValueSet",
                "([NumericalLimit] IS NOT NULL AND [CurrencyLimit] IS NULL) OR ([NumericalLimit] IS NULL AND [CurrencyLimit] IS NOT NULL)"
            );

            t.HasCheckConstraint(
                "CK_LimitValues_NumericalLimit_NonNegative",
                "[NumericalLimit] IS NULL OR [NumericalLimit] >= 0"
            );

            t.HasCheckConstraint(
                "CK_LimitValues_CurrencyLimit_NonNegative",
                "[CurrencyLimit] IS NULL OR [CurrencyLimit] >= 0"
            );
        });

        builder.ApplyAuditableConfiguration();
    }
}
