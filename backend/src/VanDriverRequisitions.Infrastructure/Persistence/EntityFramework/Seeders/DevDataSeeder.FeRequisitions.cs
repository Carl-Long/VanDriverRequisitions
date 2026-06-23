using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Application.Features.FeRequisitions.Snapshots;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private static async Task SeedFeRequisitionsAsync(
        VanDriverDbContext context,
        ILogger? logger)
    {
        const int seedCount = 1000;
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

        for (var i = 1; i <= seedCount; i++)
        {
            var shop = shops[rng.Next(shops.Count)];
            var driver = drivers[rng.Next(drivers.Count)];
            var user = FeSeedUsers[rng.Next(FeSeedUsers.Length)];

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

            var updateModel = new FeRequisitionUpdateModel(
                details,
                BuildSeedTasks(rng, taskTypes, requisitionDate),
                BuildSeedMileages(rng, requisitionDate),
                BuildSeedTransfers(rng, shops, requisitionDate),
                BuildSeedAdditionalCosts(rng, reasons, requisitionDate));

            var requisitionNumber = $"F{i:D9}";
            var requisition = FeRequisition.Create(requisitionNumber, updateModel);

            requisition.CreatedAtUtc = createdDate;
            requisition.CreatedById = user.Id;
            requisition.CreatedByNameSnapshot = user.Name;

            ApplySeedFeStatus(
                requisition,
                status,
                rng,
                createdDate,
                i);

            requisitions.Add(requisition);
        }

        context.FeRequisitions.AddRange(requisitions);

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded {Count} FE requisitions.", seedCount);
    }

    private static List<FeGeneralTaskUpdateModel> BuildSeedTasks(
        Random rng,
        List<FeTaskType> taskTypes,
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

    private static List<FeMileageUpdateModel> BuildSeedMileages(
        Random rng,
        DateOnly requisitionDate)
    {
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

    private static List<FeTransferUpdateModel> BuildSeedTransfers(
        Random rng,
        List<Shop> shops,
        DateOnly requisitionDate)
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

    private static List<FeAdditionalCostUpdateModel> BuildSeedAdditionalCosts(
        Random rng,
        List<CostReason> reasons,
        DateOnly requisitionDate)
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

    private static void ApplySeedFeStatus(FeRequisition requisition, RequisitionStatus status, Random rng, DateTime createdDate, int index)
    {
        switch (status)
        {
            case RequisitionStatus.Draft:
                return;

            case RequisitionStatus.Submitted:
            {
                var submitter = FeSeedUsers[rng.Next(FeSeedUsers.Length)];
                var submittedAtUtc = createdDate.AddHours(2);
                requisition.Submit(new AuditUser(submitter.Id, submitter.Name), submittedAtUtc, FeRequisitionSnapshotFactory.CreateJson(requisition));
                return;
            }

            case RequisitionStatus.Rejected:
            {
                var submitter = FeSeedUsers[rng.Next(FeSeedUsers.Length)];
                var rejecter = FeSeedUsers[rng.Next(FeSeedUsers.Length)];
                var submittedAtUtc = createdDate.AddHours(2);
                var rejectedAtUtc = createdDate.AddDays(1);
                var rejectedReason = RejectionReasons[rng.Next(RejectionReasons.Length)];

                requisition.Submit(new AuditUser(submitter.Id, submitter.Name), submittedAtUtc, FeRequisitionSnapshotFactory.CreateJson(requisition));
                requisition.RejectSubmission(new AuditUser(rejecter.Id, rejecter.Name), rejectedAtUtc, rejectedReason);

                return;
            }

            case RequisitionStatus.Approved:
            {
                var submitter = FeSeedUsers[rng.Next(FeSeedUsers.Length)];
                var approver = FeSeedUsers[rng.Next(FeSeedUsers.Length)];
                var submittedAtUtc = createdDate.AddHours(2);
                var approvedAtUtc = createdDate.AddDays(2);
                var poNumber = BuildSeedPoNumber(index);
                
                requisition.Submit(new AuditUser(submitter.Id, submitter.Name), submittedAtUtc, FeRequisitionSnapshotFactory.CreateJson(requisition));
                requisition.ApproveSubmission(new AuditUser(approver.Id, approver.Name), approvedAtUtc, poNumber);
                return;
            }

            default:
                throw new ArgumentOutOfRangeException(
                    nameof(status),
                    status,
                    "Unknown FE status attempted during seed.");
        }
    }
}
