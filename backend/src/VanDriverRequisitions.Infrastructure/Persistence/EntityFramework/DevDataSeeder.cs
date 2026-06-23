using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

/// <summary>
/// Seeds development/test data for LimitValues and FeTaskTypes.
/// Uses raw SQL to bypass the <see cref="Interceptors.AuditableEntityInterceptor"/>
/// which requires an authenticated HTTP context.
/// </summary>
public static class DevDataSeeder
{
    // ─────────────────────────────────────────────
    // FE Task Types / Cost Reasons (lookup only)
    // ─────────────────────────────────────────────

    private static readonly Guid CollectionsTaskTypeId = new("c0000001-0001-0001-0001-000000000001");
    private static readonly Guid DeliveriesTaskTypeId = new("c0000001-0001-0001-0001-000000000002");
    private static readonly Guid WasteTaskTypeId = new("c0000001-0001-0001-0001-000000000003");
    private static readonly Guid LoadingTaskTypeId = new("c0000001-0001-0001-0001-000000000004");
    
    private static readonly Guid ParkingReasonId = new("f0000001-0001-0001-0001-000000000001");
    private static readonly Guid TollReasonId = new("f0000001-0001-0001-0001-000000000002");
    private static readonly Guid WaitingTimeReasonId = new("f0000001-0001-0001-0001-000000000003");
    private static readonly Guid ExtraMileageReasonId = new("f0000001-0001-0001-0001-000000000004");
    private static readonly Guid OldParkingReasonId = new("f0000001-0001-0001-0001-000000000005");
    
    // ─────────────────────────────────────────────
    // STD Collection Types
    // ─────────────────────────────────────────────

    private static readonly Guid StdBookBanksCollectionTypeId = new("c1000001-0001-0001-0001-000000000001");
    private static readonly Guid StdClothingBanksCollectionTypeId = new("c1000001-0001-0001-0001-000000000002");
    private static readonly Guid StdDonationBinsCollectionTypeId = new("c1000001-0001-0001-0001-000000000003");
    

    // ─────────────────────────────────────────────
    // System user (audit fallback)
    // ─────────────────────────────────────────────

    public static async Task SeedAsync(VanDriverDbContext context, ILogger? logger = null)
    {
        var hasTaskTypes = await context.FeTaskTypes.AnyAsync();
        var hasReasons = await context.CostReasons.AnyAsync();
        var hasRules = await context.RequisitionLimitRules.AnyAsync();
        var hasShops = await context.Shops.AnyAsync();
        var hasDrivers = await context.VanDrivers.AnyAsync();
        var hasRequisitions = await context.FeRequisitions.AnyAsync();
        var hasStdCollectionTypes = await context.StdCollectionTypes.AnyAsync();
        var hasStdLocations = await context.StdLocations.AnyAsync();

        if (hasTaskTypes && hasRules && hasShops && hasDrivers && hasReasons && hasRequisitions && hasStdCollectionTypes && hasStdLocations)
        {
            logger?.LogInformation("Dev seed already exists — skipping.");
            return;
        }

        logger?.LogInformation("Seeding development data...");
        
        // ─────────────────────────────────────────────
        // 1. TASK TYPES AND REASONS
        // ─────────────────────────────────────────────

        if (!hasTaskTypes)
        {
            context.FeTaskTypes.AddRange(
                new FeTaskType { Id = CollectionsTaskTypeId, Name = "Collections", Code = "23707" },
                new FeTaskType { Id = DeliveriesTaskTypeId, Name = "Deliveries", Code = "23709" },
                new FeTaskType { Id = WasteTaskTypeId, Name = "Waste", Code = "20097" },
                new FeTaskType { Id = LoadingTaskTypeId, Name = "Loading&Unloading", Code = "10119" }
            );

            await context.SaveChangesAsync();
            logger?.LogInformation("Seeded FeTaskTypes");
        }
        
        if (!hasReasons)
        {
            context.CostReasons.AddRange(
                new CostReason { Id = ParkingReasonId, Reason = "Parking", Code = "10001", Scope = CostReasonScope.Shared, IsActive = true },
                new CostReason { Id = TollReasonId, Reason = "Toll charge", Code = "10002", Scope = CostReasonScope.Shared, IsActive = true },
                new CostReason { Id = WaitingTimeReasonId, Reason = "Waiting time", Code = "10003", Scope = CostReasonScope.Shared, IsActive = true },
                new CostReason { Id = ExtraMileageReasonId, Reason = "Extra mileage", Code = "10004", Scope = CostReasonScope.Std, IsActive = true },
                new CostReason { Id = OldParkingReasonId, Reason = "Old parking reason", Code = "10099", Scope = CostReasonScope.Shared, IsActive = false }
            );

            await context.SaveChangesAsync();
            logger?.LogInformation("Seeded CostReasons");
        }

        
        if (!hasStdCollectionTypes)
        {
            await SeedStdCollectionTypesAsync(context, logger);
        }

        // ─────────────────────────────────────────────
        // 2. LIMIT RULES
        // ─────────────────────────────────────────────

        if (!hasRules)
        {
            context.RequisitionLimitRules.AddRange(
                // ─── General Task rules ─────────────────────
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.GeneralTask,
                        CollectionsTaskTypeId,
                        Fascia.Fe,
                        30,
                        15.00m)),
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.GeneralTask,
                        DeliveriesTaskTypeId,
                        Fascia.Fe,
                        40,
                        20.00m)),
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.GeneralTask,
                        WasteTaskTypeId,
                        Fascia.Fe,
                        50,
                        30.00m)),
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.GeneralTask,
                        LoadingTaskTypeId,
                        Fascia.Fe,
                        30,
                        15.00m)),

                // ─── Mileage ────────────────────────────────
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.Mileage,
                        null,
                        Fascia.Fe,
                        300,
                        0.50m)),

                // ─── Transfers ──────────────────────────────
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.Transfer,
                        null,
                        Fascia.Fe,
                        50,
                        10.00m)),

                // ─── Additional Costs ─
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.AdditionalCost,
                        null,
                        Fascia.Fe,
                        30,
                        15.00m)),
                // ─── STD Mileage ─────────────────────────────
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.Mileage,
                        null,
                        Fascia.Std,
                        300,
                        0.50m)),

                // ─── STD Flat Charges ───────────────────────
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.FlatCharge,
                        null,
                        Fascia.Std,
                        999,
                        25.00m)),

                // ─── STD Van Packs ──────────────────────────
                // MaxRate is used as the fixed van pack price.
                RequisitionLimitRule.Create(
                    new RequisitionLimitRuleDetails(
                        RequisitionRowCategory.VanPack,
                        null,
                        Fascia.Std,
                        50,
                        10.00m))
            );
            await context.SaveChangesAsync();
            logger?.LogInformation("Seeded RequisitionLimitRules");
        }

        // ─────────────────────────────────────────────
        // 3. Shops
        // ─────────────────────────────────────────────

        if (!hasShops)
        {
            await SeedShopsAsync(context, logger);
        }
        
        if (!hasStdLocations)
        {
            await SeedStdLocationsAsync(context, logger);
        }

        // ─────────────────────────────────────────────
        // 4. Van Drivers
        // ─────────────────────────────────────────────

        if (!hasDrivers)
        {
            await SeedVanDriversAsync(context, logger);
        }

         if (!hasRequisitions)
         {
             await SeedRequisitionsAsync(context, logger);
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
                $"{(char)('A' + (i % 26))}{(char)('A' + (i / 26 % 26))}{rng.Next(1, 20)} {rng.Next(1, 10)}{(char)('A' + rng.Next(26))}{(char)('A' + rng.Next(26))}";
            var phone = $"0{rng.Next(1000, 9999)} {rng.Next(100000, 999999)}";
            var isActive = i < 800 ? 1 : 0; // 80% active

            var separator = i < count - 1 ? "," : ";";
            sb.AppendLine(
                $"    ('{id}', '{Esc(code)}', '{Esc(name)}', '{Esc(address)}', NULL, '{Esc(town)}', '{Esc(county)}', '{Esc(postcode)}', '{Esc(phone)}', {isActive}){separator}");
        }

        await context.Database.ExecuteSqlRawAsync(sb.ToString());
        logger?.LogInformation("Seeded {Count} shops ({Active} active, {Inactive} inactive).", count, 800, 200);
    }
    
    // Std Location seeds
    
    private static readonly string[] StdLocationNames =
    [
        "High Street Charity Bank",
        "Retail Park Textile Bin",
        "Community Centre Collection Point",
        "Station Road Business Park",
        "Market Square Collection Site",
        "Church Hall Collection Point",
        "Industrial Estate Unit",
        "Village Hall Collection Point",
        "Town Centre Collection Point",
        "Supermarket Car Park Collection"
    ];
    
    private static async Task SeedStdLocationsAsync(VanDriverDbContext context, ILogger? logger)
    {
        var shops = await context.Shops
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Take(100)
            .ToListAsync();

        var collectionTypes = await context.StdCollectionTypes
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .ToListAsync();

        if (shops.Count == 0 || collectionTypes.Count == 0)
        {
            logger?.LogWarning(
                "Skipped STD locations seed because shops or STD collection types are missing. Shops: {ShopCount}, CollectionTypes: {CollectionTypeCount}",
                shops.Count,
                collectionTypes.Count);

            return;
        }

        var locations = new List<StdLocation>();
        var locationIndex = 0;

        foreach (var shop in shops)
        {
            foreach (var collectionType in collectionTypes)
            {
                var locationName = StdLocationNames[locationIndex % StdLocationNames.Length];
                
                locations.Add(new StdLocation
                {
                    Id = BuildStdLocationId(locationIndex),
                    ShopId = shop.Id,
                    CollectionTypeId = collectionType.Id,
                    LocationName = locationName,
                    PostCode = shop.Postcode,
                    IsActive = true
                });

                locationIndex++;
            }
        }

        context.StdLocations.AddRange(locations);

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded {Count} STD locations.", locations.Count);
    }

    private static Guid BuildStdLocationId(int index)
    {
        return new Guid($"c2000000-0000-0000-0000-{index:D12}");
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
        sb.AppendLine(
            "INSERT INTO VanDrivers (Id, Code, TradersName, Address1, Address2, Town, County, Postcode, Phone, VatNumber, IsActive) VALUES");

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
            var postcode =
                $"{(char)('A' + ((i + 5) % 26))}{(char)('A' + ((i / 26 + 3) % 26))}{rng.Next(1, 20)} {rng.Next(1, 10)}{(char)('A' + rng.Next(26))}{(char)('A' + rng.Next(26))}";
            var phone = $"07{rng.Next(100, 999)} {rng.Next(100000, 999999)}";
            var hasVat = i % 3 == 0; // ~33% with VAT
            var vatNumber = hasVat ? $"GB{rng.Next(100000000, 999999999)}" : "NULL";
            var isActive = i < 800 ? 1 : 0; // 80% active

            var vatValue = hasVat ? $"'{vatNumber}'" : "NULL";
            var separator = i < count - 1 ? "," : ";";
            sb.AppendLine(
                $"    ('{id}', '{Esc(code)}', '{Esc(tradersName)}', '{Esc(address1)}', NULL, '{Esc(town)}', '{Esc(county)}', '{Esc(postcode)}', '{Esc(phone)}', {vatValue}, {isActive}){separator}");
        }

        await context.Database.ExecuteSqlRawAsync(sb.ToString());
        logger?.LogInformation("Seeded {Count} van drivers ({Active} active, {Inactive} inactive).", count, 800, 200);
    }

    private static readonly (Guid Id, string Name)[] SeedUsers =
    [
        (new Guid("10000000-0000-0000-0000-000000000001"), "John Smith"),
        (new Guid("10000000-0000-0000-0000-000000000002"), "Sarah Jones"),
        (new Guid("10000000-0000-0000-0000-000000000003"), "Mike Brown"),
        (new Guid("10000000-0000-0000-0000-000000000004"), "Emma Wilson"),
        (new Guid("10000000-0000-0000-0000-000000000005"), "David Taylor"),
    ];
    
    private static async Task SeedStdCollectionTypesAsync(VanDriverDbContext context, ILogger? logger)
    {
        context.StdCollectionTypes.AddRange(
            new StdCollectionType
            {
                Id = StdBookBanksCollectionTypeId,
                Code = "27013",
                Name = "Book Banks",
                IsActive = true
            },
            new StdCollectionType
            {
                Id = StdClothingBanksCollectionTypeId,
                Code = "27012",
                Name = "Clothing Banks",
                IsActive = true
            },
            new StdCollectionType
            {
                Id = StdDonationBinsCollectionTypeId,
                Code = "27065",
                Name = "Donation Bins",
                IsActive = true
            });

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded STD collection types.");
    }

    private static async Task SeedRequisitionsAsync(VanDriverDbContext context, ILogger? logger)
    {
        const int count = 100;
        var rng = new Random(123);

        var taskTypes = await context.FeTaskTypes.ToListAsync();

        var reasons = await context.CostReasons
            .Where(x => x.IsActive)
            .Where(x => x.Scope == CostReasonScope.Fe || x.Scope == CostReasonScope.Shared)
            .ToListAsync();

        var shops = await context.Shops
            .Where(x => x.IsActive)
            .Take(200)
            .ToListAsync();

        var drivers = await context.VanDrivers
            .Where(x => x.IsActive)
            .Take(200)
            .ToListAsync();

        var requisitions = new List<FeRequisition>();

        for (var i = 1; i <= count; i++)
        {
            var shop = shops[rng.Next(shops.Count)];
            var driver = drivers[rng.Next(drivers.Count)];
            var user = SeedUsers[rng.Next(SeedUsers.Length)];

            var createdDate = DateTime.UtcNow.AddDays(-rng.Next(0, 120));

            var status = GetRandomStatus(rng);

            var hasVat = rng.Next(0, 2) == 1;

            var details = new RequisitionDetails(
                DateOnly.FromDateTime(createdDate),
                new VanDriverSnapshot(
                    driver.Id,
                    driver.Code,
                    driver.TradersName,
                    driver.TradersName,
                    hasVat),
                new ShopSnapshot(
                    shop.Id,
                    shop.Code,
                    shop.Name));

            var requisitionDate = DateOnly.FromDateTime(createdDate);

            var taskModels = BuildSeedTasks(rng, taskTypes, requisitionDate);
            var mileageModels = BuildSeedMileages(rng, requisitionDate);
            var transferModels = BuildSeedTransfers(rng, shops, requisitionDate);
            var additionalCostModels = BuildSeedAdditionalCosts(rng, reasons, requisitionDate);
            
            var requisitionNumber = $"F{i:D9}";

            var updateModel = new FeRequisitionUpdateModel(details, taskModels, mileageModels, transferModels, additionalCostModels);
            var requisition = FeRequisition.Create(requisitionNumber, updateModel);
            
            requisition.CreatedAtUtc = createdDate;
            requisition.CreatedById = user.Id;
            requisition.CreatedByNameSnapshot = user.Name;

            switch (status)
            {
                case RequisitionStatus.Draft:
                    break;

                case RequisitionStatus.Submitted:
                {
                    var submitter = SeedUsers[rng.Next(SeedUsers.Length)];
                    var submittedAtUtc = createdDate.AddHours(2);
                    requisition.Submit(new AuditUser(submitter.Id, submitter.Name), submittedAtUtc, FeRequisitionSnapshotFactory.CreateJson(requisition));
                    break;
                }

                case RequisitionStatus.Rejected:
                {
                    var submitter = SeedUsers[rng.Next(SeedUsers.Length)];
                    var rejecter = SeedUsers[rng.Next(SeedUsers.Length)];
                    var submittedAtUtc = createdDate.AddHours(2);
                    var rejectedAtUtc = createdDate.AddDays(1);
                    var rejectedReason = RejectionReasons[rng.Next(RejectionReasons.Length)];
                    requisition.Submit(new AuditUser(submitter.Id, submitter.Name), submittedAtUtc, FeRequisitionSnapshotFactory.CreateJson(requisition));
                    requisition.RejectSubmission(new AuditUser(rejecter.Id, rejecter.Name), rejectedAtUtc, rejectedReason);
                    break;
                }

                case RequisitionStatus.Approved:
                {
                    var submitter = SeedUsers[rng.Next(SeedUsers.Length)];
                    var approver = SeedUsers[rng.Next(SeedUsers.Length)];
                    var submittedAtUtc = createdDate.AddHours(2);
                    var approvedAtUtc = createdDate.AddDays(2);
                    var poNumber = BuildSeedPoNumber(i);
                    requisition.Submit(new AuditUser(submitter.Id, submitter.Name), submittedAtUtc, FeRequisitionSnapshotFactory.CreateJson(requisition));
                    requisition.ApproveSubmission(new AuditUser(approver.Id, approver.Name), approvedAtUtc, poNumber);
                    break;
                }

                default:
                    throw new ArgumentOutOfRangeException(message: "Unknown status attempted during seed", null);
            }

            requisitions.Add(requisition);
        }

        context.FeRequisitions.AddRange(requisitions);

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded {Count} requisitions.", count);
    }

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

    private static List<FeGeneralTaskUpdateModel> BuildSeedTasks(Random rng, List<FeTaskType> taskTypes,
        DateOnly requisitionDate)
    {
        var taskCount = rng.Next(1, 4);
        var selectedTaskTypes = taskTypes
            .OrderBy(_ => rng.Next())
            .Take(taskCount);

        var weekEndingDate = requisitionDate.AddDays(6 - (int)requisitionDate.DayOfWeek);

        var tasks = new List<FeGeneralTaskUpdateModel>();

        foreach (var taskType in selectedTaskTypes)
        {
            tasks.Add(new FeGeneralTaskUpdateModel(
                null,
                taskType.Id,
                taskType.Name,
                taskType.Code,
                weekEndingDate,
                new WeeklyQuantities(
                    rng.Next(0, 6),
                    rng.Next(0, 6),
                    rng.Next(0, 6),
                    rng.Next(0, 6),
                    rng.Next(0, 6),
                    rng.Next(0, 6),
                    rng.Next(0, 6)),
                Math.Round(
                    (decimal)(rng.NextDouble() * 15 + 5),
                    2)));
        }

        return tasks;
    }
    
    private static List<FeMileageUpdateModel> BuildSeedMileages(Random rng, DateOnly requisitionDate)
    {
        // Not every seeded requisition needs mileage.
        // This gives a decent spread of requisitions with and without mileage.
        var includeMileage = rng.Next(0, 2) == 1;

        if (!includeMileage)
        {
            return [];
        }

        var weekEndingDate = requisitionDate.AddDays(6 - (int)requisitionDate.DayOfWeek);

        return
        [
            new FeMileageUpdateModel(
                null,
                weekEndingDate,
                new WeeklyQuantities(
                    rng.Next(0, 41),
                    rng.Next(0, 41),
                    rng.Next(0, 41),
                    rng.Next(0, 41),
                    rng.Next(0, 41),
                    rng.Next(0, 41),
                    rng.Next(0, 41)),
                0.45m)
        ];
    }
    
    private static List<FeTransferUpdateModel> BuildSeedTransfers(Random rng, List<Shop> shops, DateOnly requisitionDate)
    {
        var includeTransfer = rng.Next(0, 2) == 1;

        if (!includeTransfer)
        {
            return [];
        }

        var fromShop = shops[rng.Next(shops.Count)];
        var toShop = shops[rng.Next(shops.Count)];

        while (toShop.Id == fromShop.Id)
        {
            toShop = shops[rng.Next(shops.Count)];
        }

        var weekEndingDate = requisitionDate.AddDays(6 - (int)requisitionDate.DayOfWeek);

        return
        [
            new FeTransferUpdateModel(
                null,
                new ShopSnapshot(
                    fromShop.Id,
                    fromShop.Code,
                    fromShop.Name),
                new ShopSnapshot(
                    toShop.Id,
                    toShop.Code,
                    toShop.Name),
                weekEndingDate,
                new WeeklyQuantities(
                    rng.Next(0, 11),
                    rng.Next(0, 11),
                    rng.Next(0, 11),
                    rng.Next(0, 11),
                    rng.Next(0, 11),
                    rng.Next(0, 11),
                    rng.Next(0, 11)),
                Math.Round(
                    (decimal)(rng.NextDouble() * 5 + 3),
                    2))
        ];
    }
    
    private static List<FeAdditionalCostUpdateModel> BuildSeedAdditionalCosts(Random rng, List<CostReason> reasons, DateOnly requisitionDate)
    {
        var includeAdditionalCost = rng.Next(0, 2) == 1;

        if (!includeAdditionalCost)
        {
            return [];
        }

        var reason = reasons[rng.Next(reasons.Count)];
        var weekEndingDate = requisitionDate.AddDays(6 - (int)requisitionDate.DayOfWeek);

        var useMileage = rng.Next(0, 2) == 1;

        if (useMileage)
        {
            return
            [
                new FeAdditionalCostUpdateModel(
                    null,
                    weekEndingDate,
                    reason.Id,
                    reason.Code,
                    reason.Reason,
                    ChargingOption.Mileage,
                    null,
                    null,
                    rng.Next(1, 101),
                    0.45m)
            ];
        }

        return
        [
            new FeAdditionalCostUpdateModel(
                null,
                weekEndingDate,
                reason.Id,
                reason.Code,
                reason.Reason,
                ChargingOption.Job,
                rng.Next(1, 11),
                Math.Round((decimal)(rng.NextDouble() * 10 + 3), 2),
                null,
                null)
        ];
    }

    private static string Esc(string value) => value.Replace("'", "''");

    private static readonly string[] RejectionReasons =
    [
        "Quantity exceeds permitted limit.",
        "Incorrect rate entered.",
        "Missing supporting information.",
        "Duplicate requisition submitted.",
        "Week ending date is invalid.",
        "Requires manager review before approval."
    ];

    private static string BuildSeedPoNumber(int i)
    {
        return $"PO-SEED-{i:D6}";
    }
}