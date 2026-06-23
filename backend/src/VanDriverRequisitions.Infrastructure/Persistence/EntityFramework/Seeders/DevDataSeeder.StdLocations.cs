using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private const int StdLocationSeedCount = 1000;

    private static readonly string[] StdLocationSiteNames =
    [
        "High Street",
        "Retail Park",
        "Community Centre",
        "Station Road",
        "Market Square",
        "Church Hall",
        "Industrial Estate",
        "Village Hall",
        "Town Centre",
        "Supermarket Car Park",
        "Leisure Centre",
        "Library Car Park",
        "Garden Centre",
        "Business Park",
        "Shopping Parade",
        "Sports Club",
        "Civic Centre",
        "Medical Centre",
        "College Campus",
        "Council Depot",
    ];

    private static readonly string[] StdLocationSiteSuffixes =
    [
        "Collection Point",
        "Donation Point",
        "Car Park Site",
        "External Bank",
        "Rear Yard",
        "Service Area",
        "Main Entrance",
        "Side Entrance",
        "Bin Store",
        "Community Site",
    ];

    private static async Task SeedStdLocationsAsync(
        VanDriverDbContext context,
        ILogger? logger)
    {
        const int shopsToUse = 250;
        const int locationsPerShop = 4;

        var shops = await context.Shops
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Take(shopsToUse)
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

        var locations = new List<StdLocation>(shops.Count * locationsPerShop);
        var locationNameCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        var locationIndex = 0;

        for (var shopIndex = 0; shopIndex < shops.Count; shopIndex++)
        {
            var shop = shops[shopIndex];

            for (var locationNumberForShop = 0; locationNumberForShop < locationsPerShop; locationNumberForShop++)
            {
                var collectionType = collectionTypes[
                    (shopIndex + locationNumberForShop) % collectionTypes.Count];

                var baseLocationName = BuildStdLocationName(
                    shop,
                    collectionType,
                    locationIndex);

                var uniqueLocationName = BuildUniqueStdLocationName(
                    baseLocationName,
                    locationNameCounts);

                var location = StdLocation.Create(
                    shop.Id,
                    collectionType.Id,
                    uniqueLocationName,
                    BuildNearbyLocationPostcode(shop.Postcode, locationIndex));

                location.Id = BuildStdLocationId(locationIndex);

                if (locationIndex % 25 == 0)
                {
                    location.Deactivate();
                }

                locations.Add(location);
                locationIndex++;
            }
        }

        context.StdLocations.AddRange(locations);

        await context.SaveChangesAsync();

        logger?.LogInformation(
            "Seeded {Count} STD locations across {ShopCount} shops ({Active} active, {Inactive} inactive).",
            locations.Count,
            shops.Count,
            locations.Count(x => x.IsActive),
            locations.Count(x => !x.IsActive));
    }

    private static string BuildStdLocationName(Shop shop, StdCollectionType collectionType, int index)
    {
        var town = string.IsNullOrWhiteSpace(shop.Town)
            ? "Local"
            : shop.Town.Trim();

        var siteName = StdLocationSiteNames[index % StdLocationSiteNames.Length];
        var suffix = StdLocationSiteSuffixes[(index / StdLocationSiteNames.Length) % StdLocationSiteSuffixes.Length];

        return $"{town} {siteName} {collectionType.Name} {suffix}";
    }

    private static string BuildNearbyLocationPostcode(string shopPostcode, int index)
    {
        var outwardCode = ExtractOutwardPostcode(shopPostcode);

        var inwardNumber = index % 9 + 1;
        var firstLetter = (char)('A' + index % 26);
        var secondLetter = (char)('A' + index / 26 % 26);

        return $"{outwardCode} {inwardNumber}{firstLetter}{secondLetter}";
    }

    private static Guid BuildStdLocationId(int index)
    {
        return new Guid($"c2000000-0000-0000-0000-{index:D12}");
    }
    
    private static string BuildUniqueStdLocationName(string baseLocationName, Dictionary<string, int> locationNameCounts)
    {
        if (!locationNameCounts.TryGetValue(baseLocationName, out var count))
        {
            locationNameCounts[baseLocationName] = 1;
            return baseLocationName;
        }

        var nextCount = count + 1;
        locationNameCounts[baseLocationName] = nextCount;

        return $"{baseLocationName} {nextCount}";
    }
}
