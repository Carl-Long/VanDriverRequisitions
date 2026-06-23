using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private static readonly (Guid Id, string Name)[] FeSeedUsers =
    [
        (new Guid("10000000-0000-0000-0000-000000000001"), "John Smith"),
        (new Guid("10000000-0000-0000-0000-000000000002"), "Sarah Jones"),
        (new Guid("10000000-0000-0000-0000-000000000003"), "Mike Brown"),
        (new Guid("10000000-0000-0000-0000-000000000004"), "Emma Wilson"),
        (new Guid("10000000-0000-0000-0000-000000000005"), "David Taylor"),
    ];

    private static readonly (Guid Id, string Name)[] StdSeedUsers =
    [
        (new Guid("20000000-0000-0000-0000-000000000001"), "Rachel Green"),
        (new Guid("20000000-0000-0000-0000-000000000002"), "Tom Walker"),
        (new Guid("20000000-0000-0000-0000-000000000003"), "Priya Patel"),
        (new Guid("20000000-0000-0000-0000-000000000004"), "Daniel Hughes"),
        (new Guid("20000000-0000-0000-0000-000000000005"), "Laura Bennett"),
    ];

    private static readonly string[] RejectionReasons =
    [
        "Quantity exceeds permitted limit.",
        "Incorrect rate entered.",
        "Missing supporting information.",
        "Duplicate requisition submitted.",
        "Week ending date is invalid.",
        "Requires manager review before approval."
    ];

    private static RequisitionStatus GetRandomStatus(Random rng)
    {
        var statuses = new[]
        {
            RequisitionStatus.Draft,
            RequisitionStatus.Submitted,
            RequisitionStatus.Rejected,
            RequisitionStatus.Approved
        };

        return statuses[rng.Next(statuses.Length)];
    }

    private static string BuildSeedPoNumber(int index)
    {
        return $"PO-SEED-{index:D6}";
    }

    private static decimal RandomMoney(Random rng, decimal min, decimal max)
    {
        return Math.Round(min + (decimal)rng.NextDouble() * (max - min), 2);
    }

    private static string ExtractOutwardPostcode(string postcode)
    {
        var trimmed = postcode.Trim().ToUpperInvariant();

        var parts = trimmed.Split(
            ' ',
            StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return parts.Length > 0
            ? parts[0]
            : "AA1";
    }

    private static string Esc(string value)
    {
        return value.Replace("'", "''");
    }
}
