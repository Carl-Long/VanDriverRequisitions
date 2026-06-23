using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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

        var sb = new StringBuilder();
        sb.AppendLine(
            "INSERT INTO VanDrivers (Id, Code, TradersName, Address1, Address2, Town, County, Postcode, Phone, VatNumber, IsActive) VALUES");

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
            var vatNumber = hasVat ? $"GB{rng.Next(100000000, 999999999)}" : "NULL";
            var vatValue = hasVat ? $"'{vatNumber}'" : "NULL";
            var isActive = i < 800 ? 1 : 0;

            var separator = i < count - 1 ? "," : ";";
            sb.AppendLine(
                $"    ('{id}', '{Esc(code)}', '{Esc(tradersName)}', '{Esc(address1)}', NULL, '{Esc(town)}', '{Esc(county)}', '{Esc(postcode)}', '{Esc(phone)}', {vatValue}, {isActive}){separator}");
        }

        await context.Database.ExecuteSqlRawAsync(sb.ToString());

        logger?.LogInformation("Seeded {Count} van drivers ({Active} active, {Inactive} inactive).", count, 800, 200);
    }
}
