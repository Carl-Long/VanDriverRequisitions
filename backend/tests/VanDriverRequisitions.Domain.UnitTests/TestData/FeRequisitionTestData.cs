using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.TestData;

public static class FeRequisitionTestData
{
    public const string RequisitionNumber = "F000000001";

    public static readonly DateOnly RequisitionDate = new(2026, 6, 13);
    public static readonly DateOnly WeekEndingDate = new(2026, 6, 13);

    // Default CreateUpdateModel totals:
    // General task: 7 jobs * £10.00 = £70.00
    // Mileage: 14 miles * £0.50 = £7.00
    // Transfer: 3 jobs * £5.00 = £15.00
    // Additional job cost: 2 jobs * £12.00 = £24.00
    // Additional mileage cost: 10 miles * £0.45 = £4.50
    // Total = £120.50
    public const decimal FullModelExpectedSubtotal = 120.50m;

    public static FeRequisitionUpdateModel CreateUpdateModel(
        RequisitionDetails? details = null,
        IReadOnlyCollection<FeGeneralTaskUpdateModel>? generalTasks = null,
        IReadOnlyCollection<FeMileageUpdateModel>? mileages = null,
        IReadOnlyCollection<FeTransferUpdateModel>? transfers = null,
        IReadOnlyCollection<FeAdditionalCostUpdateModel>? additionalCosts = null)
    {
        return new FeRequisitionUpdateModel(
            details ?? CreateDetails(),
            generalTasks ?? [CreateGeneralTaskModel()],
            mileages ?? [CreateMileageModel()],
            transfers ?? [CreateTransferModel()],
            additionalCosts ?? [CreateAdditionalJobCostModel(), CreateAdditionalMileageCostModel()]);
    }

    public static RequisitionDetails CreateDetails(
        DateOnly? requisitionDate = null,
        VanDriverSnapshot? driver = null,
        ShopSnapshot? shop = null)
    {
        return new RequisitionDetails(
            requisitionDate ?? RequisitionDate,
            driver ?? CreateDriverSnapshot(),
            shop ?? CreateShopSnapshot(code: "S001", name: "Central London Store"));
    }

    public static VanDriverSnapshot CreateDriverSnapshot(
        Guid? id = null,
        string code = "810001",
        string name = "John Smith",
        string tradersName = "John Smith Trading",
        bool hasVat = true)
    {
        return new VanDriverSnapshot(id ?? Guid.NewGuid(), code, name, tradersName, hasVat);
    }

    public static ShopSnapshot CreateShopSnapshot(Guid? id = null, string code = "S001", string name = "Test Shop")
    {
        return new ShopSnapshot(id ?? Guid.NewGuid(), code, name);
    }

    public static FeGeneralTaskUpdateModel CreateGeneralTaskModel(
        Guid? id = null,
        Guid? feTaskTypeId = null,
        string taskTypeName = "Collections",
        string taskTypeCode = "23707",
        DateOnly? weekEndingDate = null,
        WeeklyQuantities? week = null,
        decimal? ratePerJob = 10m)
    {
        return new FeGeneralTaskUpdateModel(
            id,
            feTaskTypeId ?? Guid.NewGuid(),
            taskTypeName,
            taskTypeCode,
            weekEndingDate ?? WeekEndingDate,
            week ?? CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob);
    }

    public static FeMileageUpdateModel CreateMileageModel(
        Guid? id = null,
        DateOnly? weekEndingDate = null,
        WeeklyQuantities? week = null,
        decimal? ratePerMile = 0.50m)
    {
        return new FeMileageUpdateModel(
            id,
            weekEndingDate ?? WeekEndingDate,
            week ?? CreateWeek(2, 2, 2, 2, 2, 2, 2),
            ratePerMile);
    }

    public static FeTransferUpdateModel CreateTransferModel(
        Guid? id = null,
        ShopSnapshot? fromShop = null,
        ShopSnapshot? toShop = null,
        DateOnly? weekEndingDate = null,
        WeeklyQuantities? week = null,
        decimal? ratePerJob = 5m)
    {
        return new FeTransferUpdateModel(
            id,
            fromShop ?? CreateShopSnapshot(code: "S001", name: "From Shop"),
            toShop ?? CreateShopSnapshot(code: "S002", name: "To Shop"),
            weekEndingDate ?? WeekEndingDate,
            week ?? CreateWeek(1, 1, 1, 0, 0, 0, 0),
            ratePerJob);
    }

    public static FeAdditionalCostUpdateModel CreateAdditionalJobCostModel(
        Guid? id = null,
        DateOnly? weekEndingDate = null,
        Guid? reasonId = null,
        string reasonText = "Parking",
        int? totalNumber = 2,
        decimal? ratePerJob = 12m)
    {
        return new FeAdditionalCostUpdateModel(
            id,
            weekEndingDate ?? WeekEndingDate,
            reasonId ?? Guid.NewGuid(),
            reasonText,
            ChargingOption.Job,
            totalNumber,
            ratePerJob,
            Miles: null,
            RatePerMile: null);
    }

    public static FeAdditionalCostUpdateModel CreateAdditionalMileageCostModel(
        Guid? id = null,
        DateOnly? weekEndingDate = null,
        Guid? reasonId = null,
        string reasonText = "Extra mileage",
        int? miles = 10,
        decimal? ratePerMile = 0.45m)
    {
        return new FeAdditionalCostUpdateModel(
            id,
            weekEndingDate ?? WeekEndingDate,
            reasonId ?? Guid.NewGuid(),
            reasonText,
            ChargingOption.Mileage,
            TotalNumber: null,
            RatePerJob: null,
            miles,
            ratePerMile);
    }
    
    public static AuditUser CreateAuditUser(Guid? id = null, string nameSnapshot = "Test User")
    {
        return new AuditUser(id ?? Guid.NewGuid(), nameSnapshot);
    }
}