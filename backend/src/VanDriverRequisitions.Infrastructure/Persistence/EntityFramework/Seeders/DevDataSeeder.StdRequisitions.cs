using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Seeders;

public static partial class DevDataSeeder
{
    private const int StdRequisitionSeedCount = 1000;

    private sealed record StdLocationSeedLookup(
        Guid Id,
        Guid ShopId,
        Guid CollectionTypeId,
        string CollectionTypeCode,
        string CollectionTypeName,
        string LocationName,
        string PostCode);

    private static async Task SeedStdRequisitionsAsync(VanDriverDbContext context, ILogger? logger)
    {
        var rng = new Random(456);

        var reasons = await context.CostReasons
            .Where(x => x.IsActive)
            .Where(x => x.Scope == CostReasonScope.Std || x.Scope == CostReasonScope.Shared)
            .ToListAsync();

        var shops = await context.Shops
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Take(500)
            .ToListAsync();

        var drivers = await context.VanDrivers
            .Where(x => x.IsActive)
            .OrderBy(x => x.Code)
            .Take(500)
            .ToListAsync();

        var locations = await context.StdLocations
            .Where(x => x.IsActive)
            .OrderBy(x => x.LocationName)
            .Select(x => new StdLocationSeedLookup(
                x.Id,
                x.ShopId,
                x.CollectionTypeId,
                x.CollectionType.Code,
                x.CollectionType.Name,
                x.LocationName,
                x.PostCode))
            .ToListAsync();

        if (shops.Count == 0 ||
            drivers.Count == 0 ||
            reasons.Count == 0 ||
            locations.Count == 0)
        {
            logger?.LogWarning(
                "Skipped STD requisitions seed because required seed data is missing. Shops: {ShopCount}, Drivers: {DriverCount}, Reasons: {ReasonCount}, Locations: {LocationCount}",
                shops.Count,
                drivers.Count,
                reasons.Count,
                locations.Count);

            return;
        }

        var requisitions = new List<StdRequisition>(StdRequisitionSeedCount);

        for (var i = 1; i <= StdRequisitionSeedCount; i++)
        {
            var shop = shops[rng.Next(shops.Count)];
            var driver = drivers[rng.Next(drivers.Count)];
            var user = StdSeedUsers[rng.Next(StdSeedUsers.Length)];

            var createdDate = DateTime.UtcNow.AddDays(-rng.Next(0, 180));
            var requisitionDate = DateOnly.FromDateTime(createdDate);
            var status = GetRandomStatus(rng);
            var hasVat = rng.Next(0, 2) == 1;

            var details = new StdRequisitionDetails(
                requisitionDate,
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

            var updateModel = new StdRequisitionUpdateModel(
                details,
                BuildSeedStdPickups(rng, requisitionDate),
                BuildSeedStdTransfers(rng, shops, shop, requisitionDate),
                BuildSeedStdCollectionCharges(rng, locations, shop.Id, requisitionDate),
                BuildSeedStdVanPacks(rng, shop, requisitionDate),
                BuildSeedStdAdditionalCosts(rng, reasons, requisitionDate));

            var requisitionNumber = $"S{i:D9}";
            var requisition = StdRequisition.Create(requisitionNumber, updateModel);

            requisition.CreatedAtUtc = createdDate;
            requisition.CreatedById = user.Id;
            requisition.CreatedByNameSnapshot = user.Name;

            ApplySeedStdStatus(
                requisition,
                status,
                rng,
                createdDate,
                i);

            requisitions.Add(requisition);
        }

        context.StdRequisitions.AddRange(requisitions);

        await context.SaveChangesAsync();

        logger?.LogInformation("Seeded {Count} STD requisitions.", requisitions.Count);
    }

    private static List<StdPickupUpdateModel> BuildSeedStdPickups(
        Random rng,
        DateOnly requisitionDate)
    {
        if (rng.Next(0, 100) < 20)
        {
            return [];
        }

        var rows = rng.Next(1, 3);
        var pickups = new List<StdPickupUpdateModel>(rows);

        for (var i = 0; i < rows; i++)
        {
            var charge = BuildSeedStdCharge(rng, 8m, 30m);

            pickups.Add(new StdPickupUpdateModel(
                null,
                requisitionDate.AddDays(rng.Next(0, 7)),
                rng.Next(1, 35),
                rng.Next(1, 12),
                charge.ChargeType,
                charge.Miles,
                charge.RatePerMile,
                charge.FlatCharge));
        }

        return pickups;
    }

    private static List<StdTransferUpdateModel> BuildSeedStdTransfers(
        Random rng,
        List<Shop> shops,
        Shop selectedShop,
        DateOnly requisitionDate)
    {
        if (rng.Next(0, 100) < 45)
        {
            return [];
        }

        var toShop = shops[rng.Next(shops.Count)];

        while (toShop.Id == selectedShop.Id)
        {
            toShop = shops[rng.Next(shops.Count)];
        }

        var charge = BuildSeedStdCharge(rng, 10m, 35m);

        return
        [
            new StdTransferUpdateModel(
                null,
                requisitionDate.AddDays(rng.Next(0, 7)),
                new ShopSnapshot(
                    selectedShop.Id,
                    selectedShop.Code,
                    selectedShop.Name),
                new ShopSnapshot(
                    toShop.Id,
                    toShop.Code,
                    toShop.Name),
                rng.Next(1, 35),
                rng.Next(0, 12),
                charge.ChargeType,
                charge.Miles,
                charge.RatePerMile,
                charge.FlatCharge)
        ];
    }

    private static List<StdCollectionChargeBanksAndBinsUpdateModel> BuildSeedStdCollectionCharges(
        Random rng,
        List<StdLocationSeedLookup> locations,
        Guid shopId,
        DateOnly requisitionDate)
    {
        var shopLocations = locations
            .Where(x => x.ShopId == shopId)
            .OrderBy(_ => rng.Next())
            .Take(rng.Next(1, 4))
            .ToList();

        if (shopLocations.Count == 0)
        {
            return [];
        }

        var rows = new List<StdCollectionChargeBanksAndBinsUpdateModel>(shopLocations.Count);

        foreach (var location in shopLocations)
        {
            var charge = BuildSeedStdCharge(rng, 8m, 25m);

            rows.Add(new StdCollectionChargeBanksAndBinsUpdateModel(
                null,
                requisitionDate.AddDays(rng.Next(0, 7)),

                location.CollectionTypeId,
                location.CollectionTypeName,
                location.CollectionTypeCode,

                location.Id,
                location.ShopId,
                location.CollectionTypeId,
                location.LocationName,
                location.PostCode,

                rng.Next(1, 80),

                charge.ChargeType,
                charge.Miles,
                charge.RatePerMile,
                charge.FlatCharge));
        }

        return rows;
    }

    private static List<StdCollectionVanPackUpdateModel> BuildSeedStdVanPacks(
        Random rng,
        Shop shop,
        DateOnly requisitionDate)
    {
        if (rng.Next(0, 100) < 55)
        {
            return [];
        }

        var vanPacksOut = rng.Next(5, 80);
        var filledBags = rng.Next(1, vanPacksOut + 1);

        return
        [
            new StdCollectionVanPackUpdateModel(
                null,
                requisitionDate.AddDays(rng.Next(0, 7)),
                ExtractOutwardPostcode(shop.Postcode),
                vanPacksOut,
                filledBags,
                10.00m)
        ];
    }

    private static List<StdAdditionalCostUpdateModel> BuildSeedStdAdditionalCosts(
        Random rng,
        List<CostReason> reasons,
        DateOnly requisitionDate)
    {
        if (rng.Next(0, 100) < 55)
        {
            return [];
        }

        var reason = reasons[rng.Next(reasons.Count)];
        var charge = BuildSeedStdCharge(rng, 5m, 20m);

        return
        [
            new StdAdditionalCostUpdateModel(
                null,
                requisitionDate.AddDays(rng.Next(0, 7)),
                reason.Id,
                reason.Code,
                reason.Reason,
                rng.Next(1, 25),
                charge.ChargeType,
                charge.Miles,
                charge.RatePerMile,
                charge.FlatCharge)
        ];
    }

    private static (StdChargeType ChargeType, int? Miles, decimal? RatePerMile, decimal? FlatCharge)
        BuildSeedStdCharge(
            Random rng,
            decimal minFlatCharge,
            decimal maxFlatCharge)
    {
        var useMileage = rng.Next(0, 2) == 1;

        if (useMileage)
        {
            return (
                StdChargeType.Mileage,
                rng.Next(1, 101),
                0.45m,
                null);
        }

        return (
            StdChargeType.FlatCharge,
            null,
            null,
            RandomMoney(rng, minFlatCharge, maxFlatCharge));
    }

    private static void ApplySeedStdStatus(
        StdRequisition requisition,
        RequisitionStatus status,
        Random rng,
        DateTime createdDate,
        int index)
    {
        switch (status)
        {
            case RequisitionStatus.Draft:
                return;

            case RequisitionStatus.Submitted:
            {
                var submitter = StdSeedUsers[rng.Next(StdSeedUsers.Length)];
                var submittedAtUtc = createdDate.AddHours(2);

                requisition.Submit(
                    new AuditUser(submitter.Id, submitter.Name),
                    submittedAtUtc,
                    StdRequisitionSnapshotFactory.CreateJson(requisition));

                return;
            }

            case RequisitionStatus.Rejected:
            {
                var submitter = StdSeedUsers[rng.Next(StdSeedUsers.Length)];
                var rejecter = StdSeedUsers[rng.Next(StdSeedUsers.Length)];
                var submittedAtUtc = createdDate.AddHours(2);
                var rejectedAtUtc = createdDate.AddDays(1);
                var rejectedReason = RejectionReasons[rng.Next(RejectionReasons.Length)];

                requisition.Submit(
                    new AuditUser(submitter.Id, submitter.Name),
                    submittedAtUtc,
                    StdRequisitionSnapshotFactory.CreateJson(requisition));

                requisition.RejectSubmission(
                    new AuditUser(rejecter.Id, rejecter.Name),
                    rejectedAtUtc,
                    rejectedReason);

                return;
            }

            case RequisitionStatus.Approved:
            {
                var submitter = StdSeedUsers[rng.Next(StdSeedUsers.Length)];
                var approver = StdSeedUsers[rng.Next(StdSeedUsers.Length)];
                var submittedAtUtc = createdDate.AddHours(2);
                var approvedAtUtc = createdDate.AddDays(2);
                var poNumber = BuildSeedPoNumber(index);

                requisition.Submit(
                    new AuditUser(submitter.Id, submitter.Name),
                    submittedAtUtc,
                    StdRequisitionSnapshotFactory.CreateJson(requisition));

                requisition.ApproveSubmission(
                    new AuditUser(approver.Id, approver.Name),
                    approvedAtUtc,
                    poNumber);

                return;
            }

            default:
                throw new ArgumentOutOfRangeException(
                    nameof(status),
                    status,
                    "Unknown STD status attempted during seed.");
        }
    }
}
