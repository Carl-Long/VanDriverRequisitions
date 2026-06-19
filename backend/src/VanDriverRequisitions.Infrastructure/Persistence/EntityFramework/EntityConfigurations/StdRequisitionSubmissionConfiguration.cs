using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class StdRequisitionSubmissionConfiguration : IEntityTypeConfiguration<StdRequisitionSubmission>
{
    public void Configure(EntityTypeBuilder<StdRequisitionSubmission> builder)
    {
        builder.ToTable("StdRequisitionSubmissions");

        builder.HasKey(x => x.Id);

        builder.HasOne<StdRequisition>()
            .WithMany(x => x.Submissions)
            .HasForeignKey(x => x.StdRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(x => x.SubmissionNumber)
            .IsRequired();

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.SubmittedById)
            .IsRequired();

        builder.Property(x => x.SubmittedByNameSnapshot)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.SubmittedAtUtc)
            .HasColumnType("datetime2")
            .IsRequired()
            .HasConversion(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Property(x => x.ReviewedById);

        builder.Property(x => x.ReviewedByNameSnapshot)
            .HasMaxLength(256);

        builder.Property(x => x.ReviewedAtUtc)
            .HasColumnType("datetime2")
            .HasConversion(
                v => v,
                v => v.HasValue
                    ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc)
                    : v);

        builder.Property(x => x.PoNumber)
            .HasMaxLength(50);

        builder.Property(x => x.RejectionNotes)
            .HasMaxLength(1000);

        builder.Property(x => x.SnapshotJson)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.HasIndex(x => new { x.StdRequisitionId, x.SubmissionNumber })
            .IsUnique();

        builder.ApplyAuditableConfiguration();
    }
}