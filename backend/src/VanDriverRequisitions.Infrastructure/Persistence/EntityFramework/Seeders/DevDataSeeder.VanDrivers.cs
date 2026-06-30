using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private static readonly string[] FirstNames =
    [
        "James", "John", "Robert", "Michael", "David", "William", "Richard", "Thomas", "Daniel", "Matthew",
        "Andrew", "Christopher", "Joseph", "Mark", "Paul", "Steven", "George", "Edward", "Brian", "Kevin",
        "Ian", "Peter", "Alan", "Simon", "Gary", "Stephen", "Philip", "Colin", "Martin", "Graham",
        "Barry", "Stuart", "Craig", "Derek", "Neil", "Keith", "Gordon", "Ross", "Darren", "Lee",
    ];

    private static readonly string[] LastNames =
    [
        "Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson", "Evans", "Thomas", "Johnson",
        "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall",
        "Lewis", "Harris", "Clarke", "Patel", "Jackson", "Wood", "Turner", "Martin", "Cooper", "Hill",
        "Ward", "Morris", "Moore", "Clark", "King", "Baker", "Harrison", "Morgan", "Allen", "James",
    ];

    private static async Task SeedVanDriversAsync(VanDriverDbContext context, ILogger? logger)
    {
        const int count = 1000;
        var rng = new Random(99);

        var drivers = new List<VanDriver>(count);

        for (var i = 0; i < count; i++)
        {
            var id = new Guid($"e0000000-0000-0000-0000-{i:D12}");
            var code = $"81{i + 1:D4}";
            var first = FirstNames[i % FirstNames.Length];
            var last = LastNames[(i / FirstNames.Length + i) % LastNames.Length];
            var tradersName = $"{first} {last}";
            var townIdx = (i + 7) % Towns.Length;
            var town = Towns[townIdx];
            var county = Counties[townIdx];
            var address1 = $"{rng.Next(1, 300)} {StreetNames[(i + 3) % StreetNames.Length]}";
            var postcode =
                $"{(char)('A' + (i + 5) % 26)}{(char)('A' + (i / 26 + 3) % 26)}{rng.Next(1, 20)} {rng.Next(1, 10)}{(char)('A' + rng.Next(26))}{(char)('A' + rng.Next(26))}";
            var phone = $"07{rng.Next(100, 999)} {rng.Next(100000, 999999)}";
            var hasVat = i % 3 == 0;
            var vatNumber = hasVat
                ? $"GB{rng.Next(100000000, 999999999)}"
                : null;
            var isActive = i < 800;

            drivers.Add(new VanDriver
            {
                Id = id,
                Code = code,
                TradersName = tradersName,
                Address1 = address1,
                Address2 = null,
                Town = town,
                County = county,
                Postcode = postcode,
                Phone = phone,
                VatNumber = vatNumber,
                IsActive = isActive
            });
        }

        context.VanDrivers.AddRange(drivers);

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded {Count} van drivers ({Active} active, {Inactive} inactive).", count, 800, 200);
    }
}
