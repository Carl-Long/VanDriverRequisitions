using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

namespace VanDriverRequisitions.Api.Extensions;

public static class DatabaseStartupExtensions
{
    public static async Task ApplyDatabaseStartupTasksAsync(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            return;
        }

        var applyMigrations = app.Configuration.GetValue("Database:ApplyMigrations", defaultValue: true);

        var seedData = app.Configuration.GetValue("Database:SeedData", defaultValue: true);

        if (!applyMigrations && !seedData)
        {
            return;
        }

        await using var scope = app.Services.CreateAsyncScope();

        var db = scope.ServiceProvider.GetRequiredService<VanDriverDbContext>();
        var loggerFactory = scope.ServiceProvider.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger("DatabaseStartup");

        if (applyMigrations)
        {
            logger.LogInformation("Applying database migrations...");

            var strategy = db.Database.CreateExecutionStrategy();

            await strategy.ExecuteAsync(async () =>
            {
                await db.Database.MigrateAsync();
            });

            logger.LogInformation("Database migrations applied.");
        }

        if (seedData)
        {
            logger.LogInformation("Seeding development data...");
            await DevDataSeeder.SeedAsync(db, logger);
            logger.LogInformation("Development data seeding complete.");
        }
    }
}