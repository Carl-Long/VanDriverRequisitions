using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Constants;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private enum RequisitionSequence
    {
        Fe,
        Std
    }

    private static async Task AlignRequisitionSequencesAsync(VanDriverDbContext context, ILogger? logger)
    {
        var feNumbers = await context.FeRequisitions
            .IgnoreQueryFilters()
            .Select(x => x.RequisitionNumber)
            .ToListAsync();

        var stdNumbers = await context.StdRequisitions
            .IgnoreQueryFilters()
            .Select(x => x.RequisitionNumber)
            .ToListAsync();

        var nextFeNumber = GetNextRequisitionSequenceValue(feNumbers, DbSequences.FeRequisitionNumberStartsAt);
        var nextStdNumber = GetNextRequisitionSequenceValue(stdNumbers, DbSequences.StdRequisitionNumberStartsAt);

        await RestartSequenceAsync(context, RequisitionSequence.Fe, nextFeNumber);
        await RestartSequenceAsync(context, RequisitionSequence.Std, nextStdNumber);

        logger?.LogInformation(
            "Aligned requisition sequences. Next FE: {NextFeNumber}, Next STD: {NextStdNumber}",
            nextFeNumber,
            nextStdNumber);
    }

    private static int GetNextRequisitionSequenceValue(IReadOnlyCollection<string> requisitionNumbers, int defaultStartValue)
    {
        var maxExistingNumber = requisitionNumbers
            .Select(ExtractNumericPart)
            .DefaultIfEmpty(defaultStartValue - 1)
            .Max();

        return maxExistingNumber + 1;
    }

    private static int ExtractNumericPart(string requisitionNumber)
    {
        var digits = NonDigitRegex().Replace(requisitionNumber, string.Empty);
        return int.TryParse(digits, out var number) ? number : 0;
    }

    [SuppressMessage(
        "Security",
        "EF1002:Risk of vulnerability to SQL injection",
        Justification = "Sequence names are selected from a closed enum and nextValue is an integer derived from existing requisition numbers.")]
    private static Task<int> RestartSequenceAsync(VanDriverDbContext context, RequisitionSequence sequence, int nextValue)
    {
        if (nextValue < 1)
        {
            throw new InvalidOperationException($"Cannot restart requisition sequence with invalid value '{nextValue}'.");
        }

        var sql = sequence switch
        {
            RequisitionSequence.Fe => BuildRestartSequenceSql(DbSequences.FeRequisitionNumber, nextValue),
            RequisitionSequence.Std => BuildRestartSequenceSql(DbSequences.StdRequisitionNumber, nextValue),
            _ => throw new ArgumentOutOfRangeException(nameof(sequence), sequence, "Unknown requisition sequence.")
        };

        return context.Database.ExecuteSqlRawAsync(sql);
    }

    private static string BuildRestartSequenceSql(string sequenceName, int nextValue)
    {
        return $"""
            ALTER SEQUENCE [dbo].[{sequenceName}]
            RESTART WITH {nextValue};
            """;
    }

    [GeneratedRegex("[^0-9]")]
    private static partial Regex NonDigitRegex();
}