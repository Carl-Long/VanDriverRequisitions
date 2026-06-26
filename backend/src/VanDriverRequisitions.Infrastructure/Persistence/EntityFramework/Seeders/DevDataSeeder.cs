using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

/// <summary>
/// Seeds development/test data.
/// Uses a partial class so each seed area can stay in a focused file.
/// </summary>
public static partial class DevDataSeeder
{
    public static async Task SeedAsync(VanDriverDbContext context, ILogger? logger = null)
    {
        var hasTaskTypes = await context.FeTaskTypes.AnyAsync();
        var hasReasons = await context.CostReasons.AnyAsync();
        var hasRules = await context.RequisitionLimitRules.AnyAsync();
        var hasShops = await context.Shops.AnyAsync();
        var hasDrivers = await context.VanDrivers.AnyAsync();
        var hasFeRequisitions = await context.FeRequisitions.AnyAsync();
        var hasStdRequisitions = await context.StdRequisitions.AnyAsync();
        var hasStdCollectionTypes = await context.StdCollectionTypes.AnyAsync();
        var hasStdLocations = await context.StdLocations.AnyAsync();

        if (hasTaskTypes &&
            hasRules &&
            hasShops &&
            hasDrivers &&
            hasReasons &&
            hasFeRequisitions &&
            hasStdRequisitions &&
            hasStdCollectionTypes &&
            hasStdLocations)
        {
            logger?.LogInformation("Dev seed already exists — aligning requisition sequences only.");

            await AlignRequisitionSequencesAsync(context, logger);

            return;
        }

        logger?.LogInformation("Seeding development data...");

        if (!hasTaskTypes)
        {
            await SeedFeTaskTypesAsync(context, logger);
        }

        if (!hasReasons)
        {
            await SeedCostReasonsAsync(context, logger);
        }

        if (!hasStdCollectionTypes)
        {
            await SeedStdCollectionTypesAsync(context, logger);
        }

        if (!hasRules)
        {
            await SeedRequisitionLimitRulesAsync(context, logger);
        }

        if (!hasShops)
        {
            await SeedShopsAsync(context, logger);
        }

        if (!hasStdLocations)
        {
            await SeedStdLocationsAsync(context, logger);
        }

        if (!hasDrivers)
        {
            await SeedVanDriversAsync(context, logger);
        }

        if (!hasFeRequisitions)
        {
            await SeedFeRequisitionsAsync(context, logger);
        }

        if (!hasStdRequisitions)
        {
            await SeedStdRequisitionsAsync(context, logger);
        }
        
        await AlignRequisitionSequencesAsync(context, logger);
        
        logger?.LogInformation("Development seeding complete.");
    }
}
