using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private static readonly string[] Towns =
    [
        "London", "Birmingham", "Manchester", "Leeds", "Sheffield",
        "Liverpool", "Bristol", "Newcastle", "Nottingham", "Southampton",
        "Leicester", "Coventry", "Bradford", "Cardiff", "Belfast",
        "Edinburgh", "Glasgow", "Aberdeen", "Swansea", "Oxford",
        "Cambridge", "Brighton", "Plymouth", "Wolverhampton", "Derby",
        "Stoke-on-Trent", "Sunderland", "York", "Portsmouth", "Reading",
        "Luton", "Bournemouth", "Middlesbrough", "Blackpool", "Bolton",
        "Ipswich", "Peterborough", "Telford", "Huddersfield", "Slough",
    ];

    private static readonly string[] Counties =
    [
        "Greater London", "West Midlands", "Greater Manchester", "West Yorkshire", "South Yorkshire",
        "Merseyside", "Avon", "Tyne and Wear", "Nottinghamshire", "Hampshire",
        "Leicestershire", "West Midlands", "West Yorkshire", "South Glamorgan", "Antrim",
        "Midlothian", "Lanarkshire", "Aberdeenshire", "West Glamorgan", "Oxfordshire",
        "Cambridgeshire", "East Sussex", "Devon", "West Midlands", "Derbyshire",
        "Staffordshire", "Tyne and Wear", "North Yorkshire", "Hampshire", "Berkshire",
        "Bedfordshire", "Dorset", "Cleveland", "Lancashire", "Greater Manchester",
        "Suffolk", "Cambridgeshire", "Shropshire", "West Yorkshire", "Berkshire",
    ];

    private static readonly string[] StreetNames =
    [
        "High Street", "Station Road", "Church Lane", "Park Avenue", "Mill Road",
        "Victoria Street", "King Street", "Queen Street", "London Road", "Market Street",
        "Bridge Street", "Castle Road", "Elm Grove", "Oak Drive", "Cedar Close",
        "Maple Way", "Willow Lane", "Birch Road", "Ash Street", "Pine Avenue",
    ];

    private static readonly string[] ShopPrefixes =
    [
        "Central", "North", "South", "East", "West", "Upper", "Lower", "Old", "New", "Great",
        "Little", "Market", "Royal", "City", "Town", "Valley", "Hill", "Park", "Lake", "River",
    ];

    private static readonly string[] ShopSuffixes =
    [
        "Store", "Shop", "Market", "Express", "Local", "Depot", "Branch", "Outlet",
        "Centre", "Point", "Hub", "Place", "Corner", "Square", "Yard",
    ];

    private static async Task SeedShopsAsync(
        VanDriverDbContext context,
        ILogger? logger)
    {
        const int count = 1000;
        var rng = new Random(42);

        var sb = new StringBuilder();
        sb.AppendLine(
            "INSERT INTO Shops (Id, Code, Name, Address, Address2, Town, County, Postcode, Phone, IsActive) VALUES");

        for (var i = 0; i < count; i++)
        {
            var id = new Guid($"d0000000-0000-0000-0000-{i:D12}");
            var code = $"T{i + 1:D4}";
            var townIdx = i % Towns.Length;
            var town = Towns[townIdx];
            var county = Counties[townIdx];
            var prefix = ShopPrefixes[i % ShopPrefixes.Length];
            var suffix = ShopSuffixes[i % ShopSuffixes.Length];
            var name = $"{prefix} {town} {suffix}";
            var address = $"{rng.Next(1, 200)} {StreetNames[i % StreetNames.Length]}";
            var postcode =
                $"{(char)('A' + i % 26)}{(char)('A' + i / 26 % 26)}{rng.Next(1, 20)} {rng.Next(1, 10)}{(char)('A' + rng.Next(26))}{(char)('A' + rng.Next(26))}";
            var phone = $"0{rng.Next(1000, 9999)} {rng.Next(100000, 999999)}";
            var isActive = i < 800 ? 1 : 0;

            var separator = i < count - 1 ? "," : ";";
            sb.AppendLine(
                $"    ('{id}', '{Esc(code)}', '{Esc(name)}', '{Esc(address)}', NULL, '{Esc(town)}', '{Esc(county)}', '{Esc(postcode)}', '{Esc(phone)}', {isActive}){separator}");
        }

        await context.Database.ExecuteSqlRawAsync(sb.ToString());

        logger?.LogInformation("Seeded {Count} shops ({Active} active, {Inactive} inactive).", count, 800, 200);
    }
}
