using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

/// <summary>
/// Seeds development/test data for LimitValues and FeTaskTypes.
/// Uses raw SQL to bypass the <see cref="Interceptors.AuditableEntityInterceptor"/>
/// which requires an authenticated HTTP context.
/// </summary>
public static class DevDataSeeder
{
    // ── Fixed GUIDs so the seed is idempotent and FKs resolve ──────────────

    // Limit Values
    private static readonly Guid CollectionsDailyQtyLimitId = new("a0000001-0001-0001-0001-000000000001");
    private static readonly Guid CollectionsRateLimitId = new("a0000001-0001-0001-0001-000000000002");
    private static readonly Guid DeliveriesDailyQtyLimitId = new("a0000001-0001-0001-0001-000000000003");
    private static readonly Guid DeliveriesRateLimitId = new("a0000001-0001-0001-0001-000000000004");
    private static readonly Guid WasteDailyQtyLimitId = new("a0000001-0001-0001-0001-000000000005");
    private static readonly Guid WasteRateLimitId = new("a0000001-0001-0001-0001-000000000006");
    private static readonly Guid LoadingDailyQtyLimitId = new("a0000001-0001-0001-0001-000000000007");
    private static readonly Guid LoadingRateLimitId = new("a0000001-0001-0001-0001-000000000008");
    private static readonly Guid UnloadingDailyQtyLimitId = new("a0000001-0001-0001-0001-000000000009");
    private static readonly Guid UnloadingRateLimitId = new("a0000001-0001-0001-0001-00000000000a");

    // Global (well-known) limits
    private static readonly Guid MileageDailyQtyLimitId = new("b0000001-0001-0001-0001-000000000001");
    private static readonly Guid MileageRateLimitId = new("b0000001-0001-0001-0001-000000000002");
    private static readonly Guid TransferDailyQtyLimitId = new("b0000001-0001-0001-0001-000000000003");
    private static readonly Guid TransferRateLimitId = new("b0000001-0001-0001-0001-000000000004");

    // Task Types
    private static readonly Guid CollectionsTaskTypeId = new("c0000001-0001-0001-0001-000000000001");
    private static readonly Guid DeliveriesTaskTypeId = new("c0000001-0001-0001-0001-000000000002");
    private static readonly Guid WasteTaskTypeId = new("c0000001-0001-0001-0001-000000000003");
    private static readonly Guid LoadingTaskTypeId = new("c0000001-0001-0001-0001-000000000004");
    private static readonly Guid UnloadingTaskTypeId = new("c0000001-0001-0001-0001-000000000005");

    // Placeholder audit values
    private static readonly Guid SystemUserId = Guid.Empty;
    private const string SystemUserName = "SYSTEM_SEED";

    public static async Task SeedAsync(VanDriverDbContext context, ILogger? logger = null)
    {
        // Check if data already exists
        var hasLimits = await context.LimitValues
            .IgnoreQueryFilters()
            .AnyAsync();

        var hasTaskTypes = await context.FeTaskTypes
            .IgnoreQueryFilters()
            .AnyAsync();

        var hasShops = await context.Shops
            .IgnoreQueryFilters()
            .AnyAsync();

        var hasDrivers = await context.VanDrivers
            .IgnoreQueryFilters()
            .AnyAsync();

        if (hasLimits && hasTaskTypes && hasShops && hasDrivers)
        {
            logger?.LogInformation("Dev seed data already exists — skipping.");
            return;
        }

        logger?.LogInformation("Seeding development data…");

        var now = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

        // ─── Limit Values ──────────────────────────────────────────────
        if (!hasLimits)
        {
            // TypeOfLimitation: 0 = Min, 1 = Max
            // Fascia: 0 = Fe, 1 = Std, NULL = all
            var limitsSql = $"""
                INSERT INTO LimitValues
                    (Id, Title, NameOfValue, Fascia, TypeOfLimitation, NumericalLimit, CurrencyLimit, IsActive, CreatedById, CreatedByNameSnapshot, CreatedAtUtc)
                VALUES
                    -- Collections limits
                    ('{CollectionsDailyQtyLimitId}', 'Collections – Daily Qty Max', 'COLLECTIONS_DAILY_QTY', 0, 1, 30, NULL, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{CollectionsRateLimitId}',     'Collections – Rate Max',      'COLLECTIONS_RATE',     0, 1, NULL, 15.00, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),

                    -- Deliveries limits
                    ('{DeliveriesDailyQtyLimitId}', 'Deliveries – Daily Qty Max', 'DELIVERIES_DAILY_QTY', 0, 1, 25, NULL, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{DeliveriesRateLimitId}',     'Deliveries – Rate Max',      'DELIVERIES_RATE',     0, 1, NULL, 20.00, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),

                    -- Waste Disposal limits
                    ('{WasteDailyQtyLimitId}', 'Waste Disposal – Daily Qty Max', 'WASTE_DAILY_QTY', 0, 1, 10, NULL, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{WasteRateLimitId}',     'Waste Disposal – Rate Max',      'WASTE_RATE',     0, 1, NULL, 25.00, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),

                    -- Loading limits
                    ('{LoadingDailyQtyLimitId}', 'Loading – Daily Qty Max', 'LOADING_DAILY_QTY', 0, 1, 15, NULL, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{LoadingRateLimitId}',     'Loading – Rate Max',      'LOADING_RATE',     0, 1, NULL, 12.50, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),

                    -- Unloading limits
                    ('{UnloadingDailyQtyLimitId}', 'Unloading – Daily Qty Max', 'UNLOADING_DAILY_QTY', 0, 1, 15, NULL, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{UnloadingRateLimitId}',     'Unloading – Rate Max',      'UNLOADING_RATE',     0, 1, NULL, 12.50, 1, '{SystemUserId}', '{SystemUserName}', '{now}'),

                    -- Global well-known limits (used by Mileage and Transfers tabs)
                    ('{MileageDailyQtyLimitId}',  'Mileage – Daily Qty Max',  'MILEAGE_DAILY_QTY',  0, 1, 500, NULL,  1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{MileageRateLimitId}',      'Mileage – Rate Max',       'MILEAGE_RATE',       0, 1, NULL, 0.45,  1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{TransferDailyQtyLimitId}', 'Transfer – Daily Qty Max', 'TRANSFER_DAILY_QTY', 0, 1, 20, NULL,   1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{TransferRateLimitId}',     'Transfer – Rate Max',      'TRANSFER_RATE',      0, 1, NULL, 18.00, 1, '{SystemUserId}', '{SystemUserName}', '{now}');
                """;

            await context.Database.ExecuteSqlRawAsync(limitsSql);
            logger?.LogInformation("Seeded {Count} limit values.", 14);
        }

        // ─── Task Types ────────────────────────────────────────────────
        if (!hasTaskTypes)
        {
            var taskTypesSql = $"""
                INSERT INTO FeTaskTypes
                    (Id, Name, Code, DailyQuantityLimitId, RateLimitId, IsActive, CreatedById, CreatedByNameSnapshot, CreatedAtUtc)
                VALUES
                    ('{CollectionsTaskTypeId}', 'Collections', 'COL', '{CollectionsDailyQtyLimitId}', '{CollectionsRateLimitId}', 1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{DeliveriesTaskTypeId}',  'Deliveries',  'DEL', '{DeliveriesDailyQtyLimitId}', '{DeliveriesRateLimitId}',  1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{WasteTaskTypeId}',       'Waste Disposal', 'WST', '{WasteDailyQtyLimitId}',  '{WasteRateLimitId}',       1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{LoadingTaskTypeId}',     'Loading',     'LDG', '{LoadingDailyQtyLimitId}',    '{LoadingRateLimitId}',     1, '{SystemUserId}', '{SystemUserName}', '{now}'),
                    ('{UnloadingTaskTypeId}',   'Unloading',   'UNL', '{UnloadingDailyQtyLimitId}',  '{UnloadingRateLimitId}',  1, '{SystemUserId}', '{SystemUserName}', '{now}');
                """;

            await context.Database.ExecuteSqlRawAsync(taskTypesSql);
            logger?.LogInformation("Seeded {Count} task types.", 5);
        }

        // ─── Shops ─────────────────────────────────────────────────────
        if (!hasShops)
        {
            await SeedShopsAsync(context, logger);
        }

        // ─── Van Drivers ───────────────────────────────────────────────
        if (!hasDrivers)
        {
            await SeedVanDriversAsync(context, logger);
        }

        logger?.LogInformation("Development seeding complete.");
    }

    // ─── Shop seed data ────────────────────────────────────────────────────

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

    private static async Task SeedShopsAsync(VanDriverDbContext context, ILogger? logger)
    {
        const int count = 1000;
        var rng = new Random(42); // deterministic

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("INSERT INTO Shops (Id, Code, Name, Address, Address2, Town, County, Postcode, Phone, IsActive) VALUES");

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
            var postcode = $"{(char)('A' + (i % 26))}{(char)('A' + (i / 26 % 26))}{rng.Next(1, 20)} {rng.Next(1, 10)}{(char)('A' + rng.Next(26))}{(char)('A' + rng.Next(26))}";
            var phone = $"0{rng.Next(1000, 9999)} {rng.Next(100000, 999999)}";
            var isActive = i < 800 ? 1 : 0; // 80% active

            var separator = i < count - 1 ? "," : ";";
            sb.AppendLine($"    ('{id}', '{Esc(code)}', '{Esc(name)}', '{Esc(address)}', NULL, '{Esc(town)}', '{Esc(county)}', '{Esc(postcode)}', '{Esc(phone)}', {isActive}){separator}");
        }

        await context.Database.ExecuteSqlRawAsync(sb.ToString());
        logger?.LogInformation("Seeded {Count} shops ({Active} active, {Inactive} inactive).", count, 800, 200);
    }

    // ─── Van Driver seed data ──────────────────────────────────────────────

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
        var rng = new Random(99); // deterministic, different from shops

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("INSERT INTO VanDrivers (Id, Code, TradersName, Address1, Address2, Town, County, Postcode, Phone, VatNumber, IsActive) VALUES");

        for (var i = 0; i < count; i++)
        {
            var id = new Guid($"e0000000-0000-0000-0000-{i:D12}");
            var code = $"81{i + 1:D4}";
            var first = FirstNames[i % FirstNames.Length];
            var last = LastNames[(i / FirstNames.Length + i) % LastNames.Length];
            var tradersName = $"{first} {last}";
            var townIdx = (i + 7) % Towns.Length; // offset from shops
            var town = Towns[townIdx];
            var county = Counties[townIdx];
            var address1 = $"{rng.Next(1, 300)} {StreetNames[(i + 3) % StreetNames.Length]}";
            var postcode = $"{(char)('A' + ((i + 5) % 26))}{(char)('A' + ((i / 26 + 3) % 26))}{rng.Next(1, 20)} {rng.Next(1, 10)}{(char)('A' + rng.Next(26))}{(char)('A' + rng.Next(26))}";
            var phone = $"07{rng.Next(100, 999)} {rng.Next(100000, 999999)}";
            var hasVat = i % 3 == 0; // ~33% with VAT
            var vatNumber = hasVat ? $"GB{rng.Next(100000000, 999999999)}" : "NULL";
            var isActive = i < 800 ? 1 : 0; // 80% active

            var vatValue = hasVat ? $"'{vatNumber}'" : "NULL";
            var separator = i < count - 1 ? "," : ";";
            sb.AppendLine($"    ('{id}', '{Esc(code)}', '{Esc(tradersName)}', '{Esc(address1)}', NULL, '{Esc(town)}', '{Esc(county)}', '{Esc(postcode)}', '{Esc(phone)}', {vatValue}, {isActive}){separator}");
        }

        await context.Database.ExecuteSqlRawAsync(sb.ToString());
        logger?.LogInformation("Seeded {Count} van drivers ({Active} active, {Inactive} inactive).", count, 800, 200);
    }

    private static string Esc(string value) => value.Replace("'", "''");
}
