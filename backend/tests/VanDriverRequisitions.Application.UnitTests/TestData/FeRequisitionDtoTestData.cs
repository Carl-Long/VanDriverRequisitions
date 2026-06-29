using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.TestData;

public static class FeRequisitionDtoTestData
{
    public static readonly DateOnly RequisitionDate = new(2026, 6, 13);
    public static readonly DateOnly WeekEndingDate = new(2026, 6, 13);

    public static SaveFeRequisitionDto CreateRequisitionDto(
        DateOnly? requisitionDate = null,
        Guid? vanDriverId = null,
        string vanDriverName = "Test Driver",
        Guid? shopId = null,
        IReadOnlyCollection<SaveFeGeneralTaskDto>? generalTasks = null,
        IReadOnlyCollection<SaveFeMileageDto>? mileages = null,
        IReadOnlyCollection<SaveFeTransferDto>? transfers = null,
        IReadOnlyCollection<SaveFeAdditionalCostDto>? additionalCosts = null)
    {
        return new SaveFeRequisitionDto
        {
            RequisitionDate = requisitionDate ?? RequisitionDate,
            VanDriverId = vanDriverId ?? Guid.NewGuid(),
            VanDriverName = vanDriverName,
            ShopId = shopId ?? Guid.NewGuid(),
            FeGeneralTasks = generalTasks ?? [CreateGeneralTaskDto()],
            FeMileages = mileages ?? [],
            FeTransfers = transfers ?? [],
            FeAdditionalCosts = additionalCosts ?? []
        };
    }

    public static SaveFeGeneralTaskDto CreateGeneralTaskDto(
        Guid? feTaskTypeId = null,
        DateOnly? weekEndingDate = null,
        WeeklyQuantitiesDto? week = null,
        decimal? ratePerJob = 1m)
    {
        return new SaveFeGeneralTaskDto
        {
            FeTaskTypeId = feTaskTypeId ?? Guid.NewGuid(),
            WeekEndingDate = weekEndingDate ?? WeekEndingDate,
            Week = week ?? CreateWeek(),
            RatePerJob = ratePerJob
        };
    }

    public static SaveFeMileageDto CreateMileageDto(
        DateOnly? weekEndingDate = null,
        WeeklyQuantitiesDto? week = null,
        decimal? ratePerMile = 0.50m)
    {
        return new SaveFeMileageDto
        {
            WeekEndingDate = weekEndingDate ?? WeekEndingDate,
            Week = week ?? CreateWeek(),
            RatePerMile = ratePerMile
        };
    }

    public static SaveFeTransferDto CreateTransferDto(
        DateOnly? weekEndingDate = null,
        Guid? shopIdFrom = null,
        Guid? shopIdTo = null,
        WeeklyQuantitiesDto? week = null,
        decimal? ratePerJob = 1m)
    {
        var fromShopId = shopIdFrom ?? Guid.NewGuid();

        return new SaveFeTransferDto
        {
            WeekEndingDate = weekEndingDate ?? WeekEndingDate,
            ShopIdFrom = fromShopId,
            ShopIdTo = shopIdTo ?? Guid.NewGuid(),
            Week = week ?? CreateWeek(),
            RatePerJob = ratePerJob
        };
    }

    public static SaveFeAdditionalCostDto CreateJobAdditionalCostDto(
        DateOnly? weekEndingDate = null,
        Guid? reasonId = null,
        int? totalNumber = 1,
        decimal? ratePerJob = 10m)
    {
        return new SaveFeAdditionalCostDto
        {
            WeekEndingDate = weekEndingDate ?? WeekEndingDate,
            ReasonId = reasonId ?? Guid.NewGuid(),
            ChargingOption = ChargingOption.Job,
            TotalNumber = totalNumber,
            RatePerJob = ratePerJob,
            Miles = null,
            RatePerMile = null
        };
    }
    
    public static SaveFeAdditionalCostDto CreateMileageAdditionalCostDto(
        DateOnly? weekEndingDate = null,
        Guid? reasonId = null,
        int? miles = 10,
        decimal? ratePerMile = 0.45m)
    {
        return new SaveFeAdditionalCostDto
        {
            WeekEndingDate = weekEndingDate ?? WeekEndingDate,
            ReasonId = reasonId ?? Guid.NewGuid(),
            ChargingOption = ChargingOption.Mileage,
            TotalNumber = null,
            RatePerJob = null,
            Miles = miles,
            RatePerMile = ratePerMile
        };
    }

    public static WeeklyQuantitiesDto CreateWeek(
        int? sunday = 1,
        int? monday = 1,
        int? tuesday = 1,
        int? wednesday = 1,
        int? thursday = 1,
        int? friday = 1,
        int? saturday = 1)
    {
        return new WeeklyQuantitiesDto
        {
            Sunday = sunday,
            Monday = monday,
            Tuesday = tuesday,
            Wednesday = wednesday,
            Thursday = thursday,
            Friday = friday,
            Saturday = saturday
        };
    }
}