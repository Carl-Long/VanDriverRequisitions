using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeRequisitionSubmissionConfiguration : IEntityTypeConfiguration<FeRequisitionSubmission>
{
    public void Configure(EntityTypeBuilder<FeRequisitionSubmission> builder)
    {
        builder.ToTable("FeRequisitionSubmissions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .HasConversion<int>();

        builder.Property(x => x.SubmittedByNameSnapshot)
            .HasMaxLength(256);

        builder.Property(x => x.ReviewedByNameSnapshot)
            .HasMaxLength(256);
        
        builder.Property(x => x.PoNumber)
            .HasMaxLength(50);

        builder.Property(x => x.RejectionNotes)
            .HasMaxLength(1000);

        builder.Property(x => x.SnapshotJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(x => x.SubmittedAtUtc)
            .HasColumnType("datetime2")
            .IsRequired()
            .HasConversion(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Property(x => x.ReviewedAtUtc)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => v.HasValue
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v);
        

        builder.HasIndex(x =>
                new
                {
                    x.FeRequisitionId,
                    x.SubmissionNumber
                })
            .IsUnique();

        builder.ApplyAuditableConfiguration();
    }
}