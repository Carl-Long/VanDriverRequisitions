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

        if (hasLimits && hasTaskTypes)
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

        logger?.LogInformation("Development seeding complete.");
    }
}
