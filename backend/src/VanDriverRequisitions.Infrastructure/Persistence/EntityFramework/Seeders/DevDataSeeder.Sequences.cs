using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Constants;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
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

        await RestartSequenceAsync(context, DbSequences.FeRequisitionNumber, nextFeNumber);

        await RestartSequenceAsync(context, DbSequences.StdRequisitionNumber, nextStdNumber);

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
        var digits = MyRegex().Replace(requisitionNumber, string.Empty);

        return int.TryParse(digits, out var number)
            ? number
            : 0;
    }

    private static Task<int> RestartSequenceAsync(VanDriverDbContext context, string sequenceName, int nextValue)
    {
        return context.Database.ExecuteSqlRawAsync($"""
            ALTER SEQUENCE [dbo].[{sequenceName}]
            RESTART WITH {nextValue};
            """);
    }

    [GeneratedRegex("[^0-9]")]
    private static partial Regex MyRegex();
}