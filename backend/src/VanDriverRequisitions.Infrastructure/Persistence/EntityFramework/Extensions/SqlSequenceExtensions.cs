using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Constants;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Extensions;

public static class SequenceExtensions
{
    public static void ApplySequences(
        this ModelBuilder modelBuilder)
    {
        modelBuilder.HasSequence<long>(DbSequences.FeRequisitionNumber)
            .StartsAt(DbSequences.FeRequisitionNumberStartsAt)
            .IncrementsBy(DbSequences.FeRequisitionNumberIncrementsBy);

        // Future sequences:
        //  modelBuilder.HasSequence<long>(DbSequences.StdRequisitionNumber)
        //      .StartsAt(DbSequences.StdRequisitionNumberStartsAt)
        //      .IncrementsBy(DbSequences.StdRequisitionNumberIncrementsBy);
    }
}