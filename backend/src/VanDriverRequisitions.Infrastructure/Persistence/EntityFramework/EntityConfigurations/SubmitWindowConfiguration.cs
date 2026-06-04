using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class SubmitWindowConfiguration : IEntityTypeConfiguration<SubmitWindow>
{
    public void Configure(EntityTypeBuilder<SubmitWindow> builder)
    {
        builder.ToTable("SubmitWindows");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.OpenFrom)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Property(x => x.OpenTo)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_SubmitWindows_DateRange",
                "[OpenTo] > [OpenFrom]"
            );
        });

        builder.ApplyAuditableConfiguration();
        builder.ApplySoftDeleteConfiguration();
    }
}
