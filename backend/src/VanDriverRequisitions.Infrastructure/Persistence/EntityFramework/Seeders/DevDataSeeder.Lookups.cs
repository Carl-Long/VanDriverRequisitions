using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private static readonly Guid CollectionsTaskTypeId = new("c0000001-0001-0001-0001-000000000001");
    private static readonly Guid DeliveriesTaskTypeId = new("c0000001-0001-0001-0001-000000000002");
    private static readonly Guid WasteTaskTypeId = new("c0000001-0001-0001-0001-000000000003");
    private static readonly Guid LoadingTaskTypeId = new("c0000001-0001-0001-0001-000000000004");

    private static readonly Guid ParkingReasonId = new("f0000001-0001-0001-0001-000000000001");
    private static readonly Guid TollReasonId = new("f0000001-0001-0001-0001-000000000002");
    private static readonly Guid WaitingTimeReasonId = new("f0000001-0001-0001-0001-000000000003");
    private static readonly Guid ExtraMileageReasonId = new("f0000001-0001-0001-0001-000000000004");
    private static readonly Guid OldParkingReasonId = new("f0000001-0001-0001-0001-000000000005");

    private static readonly Guid StdBookBanksCollectionTypeId = new("c1000001-0001-0001-0001-000000000001");
    private static readonly Guid StdClothingBanksCollectionTypeId = new("c1000001-0001-0001-0001-000000000002");
    private static readonly Guid StdDonationBinsCollectionTypeId = new("c1000001-0001-0001-0001-000000000003");

    private static async Task SeedFeTaskTypesAsync(
        VanDriverDbContext context,
        ILogger? logger)
    {
        context.FeTaskTypes.AddRange(
            new FeTaskType { Id = CollectionsTaskTypeId, Name = "Collections", Code = "23707" },
            new FeTaskType { Id = DeliveriesTaskTypeId, Name = "Deliveries", Code = "23709" },
            new FeTaskType { Id = WasteTaskTypeId, Name = "Waste", Code = "20097" },
            new FeTaskType { Id = LoadingTaskTypeId, Name = "Loading&Unloading", Code = "10119" }
        );

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded FeTaskTypes.");
    }

    private static async Task SeedCostReasonsAsync(
        VanDriverDbContext context,
        ILogger? logger)
    {
        context.CostReasons.AddRange(
            new CostReason
            {
                Id = ParkingReasonId,
                Reason = "Parking",
                Code = "10001",
                Scope = CostReasonScope.Shared,
                IsActive = true
            },
            new CostReason
            {
                Id = TollReasonId,
                Reason = "Toll charge",
                Code = "10002",
                Scope = CostReasonScope.Shared,
                IsActive = true
            },
            new CostReason
            {
                Id = WaitingTimeReasonId,
                Reason = "Waiting time",
                Code = "10003",
                Scope = CostReasonScope.Shared,
                IsActive = true
            },
            new CostReason
            {
                Id = ExtraMileageReasonId,
                Reason = "Extra mileage",
                Code = "10004",
                Scope = CostReasonScope.Std,
                IsActive = true
            },
            new CostReason
            {
                Id = OldParkingReasonId,
                Reason = "Old parking reason",
                Code = "10099",
                Scope = CostReasonScope.Shared,
                IsActive = false
            }
        );

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded CostReasons.");
    }

    private static async Task SeedStdCollectionTypesAsync(
        VanDriverDbContext context,
        ILogger? logger)
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

    private static async Task SeedRequisitionLimitRulesAsync(
        VanDriverDbContext context,
        ILogger? logger)
    {
        context.RequisitionLimitRules.AddRange(
            // ─── FE General Task rules ─────────────────────
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

            // ─── FE Mileage ────────────────────────────────
            RequisitionLimitRule.Create(
                new RequisitionLimitRuleDetails(
                    RequisitionRowCategory.Mileage,
                    null,
                    Fascia.Fe,
                    300,
                    0.50m)),

            // ─── FE Transfers ──────────────────────────────
            RequisitionLimitRule.Create(
                new RequisitionLimitRuleDetails(
                    RequisitionRowCategory.Transfer,
                    null,
                    Fascia.Fe,
                    50,
                    10.00m)),

            // ─── FE Additional Costs ───────────────────────
            RequisitionLimitRule.Create(
                new RequisitionLimitRuleDetails(
                    RequisitionRowCategory.AdditionalCost,
                    null,
                    Fascia.Fe,
                    30,
                    15.00m)),

            // ─── STD Mileage ───────────────────────────────
            RequisitionLimitRule.Create(
                new RequisitionLimitRuleDetails(
                    RequisitionRowCategory.Mileage,
                    null,
                    Fascia.Std,
                    300,
                    0.50m)),

            // ─── STD Flat Charges ──────────────────────────
            RequisitionLimitRule.Create(
                new RequisitionLimitRuleDetails(
                    RequisitionRowCategory.FlatCharge,
                    null,
                    Fascia.Std,
                    999,
                    25.00m)),

            // ─── STD Van Packs ─────────────────────────────
            RequisitionLimitRule.Create(
                new RequisitionLimitRuleDetails(
                    RequisitionRowCategory.VanPack,
                    null,
                    Fascia.Std,
                    50,
                    10.00m))
        );

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded RequisitionLimitRules.");
    }
}
