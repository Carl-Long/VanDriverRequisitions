using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.EntityConfigurations;

public class FeGeneralTaskConfiguration : IEntityTypeConfiguration<FeGeneralTask>
{
    public void Configure(EntityTypeBuilder<FeGeneralTask> builder)
    {
        builder.ToTable("FeGeneralTasks");

        builder.HasKey(x => x.Id);

        builder.HasOne<FeRequisition>()
            .WithMany(x => x.FeGeneralTasks)
            .HasForeignKey(x => x.FeRequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.FeTaskType)
            .WithMany()
            .HasForeignKey(x => x.FeTaskTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.WeekEndingDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.RatePerJob)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalValue)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalNumber)
            .IsRequired();
        
        builder.OwnsOne(x => x.Week, week =>
        {
            week.Property(x => x.Sunday).HasColumnName("Sun");
            week.Property(x => x.Monday).HasColumnName("Mon");
            week.Property(x => x.Tuesday).HasColumnName("Tue");
            week.Property(x => x.Wednesday).HasColumnName("Wed");
            week.Property(x => x.Thursday).HasColumnName("Thu");
            week.Property(x => x.Friday).HasColumnName("Fri");
            week.Property(x => x.Saturday).HasColumnName("Sat");
        });

        // Indexes
        builder.HasIndex(x => x.FeRequisitionId);
        builder.HasIndex(x => x.FeTaskTypeId);
        builder.HasIndex(x => x.WeekEndingDate);

        // Check constraints
        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_FeGeneralTasks_TotalNumber_NonNegative",
                "[TotalNumber] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeGeneralTasks_RatePerJob_NonNegative",
                "[RatePerJob] IS NULL OR [RatePerJob] >= 0"
            );

            t.HasCheckConstraint(
                "CK_FeGeneralTasks_TotalValue_NonNegative",
                "[TotalValue] IS NULL OR [TotalValue] >= 0"
            );
        });

        builder.Apply();
    }
}