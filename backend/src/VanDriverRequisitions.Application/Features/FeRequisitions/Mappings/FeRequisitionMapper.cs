using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeRequisitionMapper
{
    public static FeRequisition MapSaveRequisitionDtoToRequisition(
        SaveFeRequisitionDto saveFeRequisitionDto,
        string requisitionNumber,
        VanDriverLookupDto driver,
        Shop shop,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypes)
    {
        return new FeRequisition
        {
            RequisitionNumber = requisitionNumber,
            RequisitionDate = saveFeRequisitionDto.RequisitionDate,
            VanDriverId = driver.Id,
            VanDriverCode = driver.Code,
            VanDriverName = saveFeRequisitionDto.VanDriverName.Trim(),
            TradersName = driver.TradersName,
            ShopId = shop.Id,
            ShopCode = shop.Code,
            ShopName = shop.Name,
            IsVatApplicable = driver.HasVat,
            Status = RequisitionStatus.Draft,

            FeGeneralTasks = saveFeRequisitionDto.FeGeneralTasks
                    .Select(x =>
                        MapGeneralTask(
                            x,
                            taskTypes))
                    .ToList()
        };
    }

    // =========================
    // DETAIL DTO
    // =========================

    public static FeRequisitionDetailDto MapRequisitionToDetailDto(FeRequisition requisition, VanDriverLookupDto vanDriverSummary)
    {

        return new FeRequisitionDetailDto
        {
            Id = requisition.Id,
            RowVersion = requisition.RowVersion,
            RequisitionNumber = requisition.RequisitionNumber,
            RequisitionDate = requisition.RequisitionDate,
            VanDriverSummary = vanDriverSummary,
            VanDriverId = requisition.VanDriverId,
            ShopId = requisition.ShopId,
            ShopCode = requisition.ShopCode,
            ShopName = requisition.ShopName,
            Status = requisition.Status,
            PoNumber = requisition.PoNumber,
            Subtotal = requisition.Subtotal,
            IsEditable = requisition.Status == RequisitionStatus.Draft || requisition.Status == RequisitionStatus.Rejected,

            FeGeneralTasks = requisition.FeGeneralTasks
                    .Select(MapGeneralTaskDetail)
                    .ToList()

        };
    }

    // =========================
    // GENERAL TASK CREATE
    // =========================

    private static FeGeneralTask MapGeneralTask(
        SaveFeGeneralTaskDto saveFeGeneralTaskDto,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypes)
    {
        var taskType = taskTypes[saveFeGeneralTaskDto.FeTaskTypeId];

        return new FeGeneralTask(
            saveFeGeneralTaskDto.FeTaskTypeId,
            taskType.Name,
            taskType.Code,
            saveFeGeneralTaskDto.WeekEndingDate,
            MapWeekDtoToWeek(saveFeGeneralTaskDto.Week),
            saveFeGeneralTaskDto.RatePerJob);
    }

    // =========================
    // GENERAL TASK DETAIL
    // =========================

    private static FeGeneralTaskDetailDto MapGeneralTaskDetail(
        FeGeneralTask task)
    {
        return new FeGeneralTaskDetailDto
        {
            Id = task.Id,
            FeTaskTypeId = task.FeTaskTypeId,
            TaskTypeName = task.TaskTypeName,
            TaskTypeCode = task.TaskTypeCode,
            WeekEndingDate = task.WeekEndingDate,
            Week = MapWeekToDto(task.Week),
            TotalNumber = task.TotalNumber,
            RatePerJob = task.RatePerJob,
            TotalValue = task.TotalValue
        };
    }

    // =========================
    // WEEK -> VALUE OBJECT
    // =========================

    private static WeeklyQuantities MapWeekDtoToWeek(
        WeeklyQuantitiesDto weeklyQuantitiesDto)
    {
        return new WeeklyQuantities(
            weeklyQuantitiesDto.Monday,
            weeklyQuantitiesDto.Tuesday,
            weeklyQuantitiesDto.Wednesday,
            weeklyQuantitiesDto.Thursday,
            weeklyQuantitiesDto.Friday,
            weeklyQuantitiesDto.Saturday,
            weeklyQuantitiesDto.Sunday);
    }

    // =========================
    // VALUE OBJECT -> DTO
    // =========================

    private static WeeklyQuantitiesDto MapWeekToDto(
        WeeklyQuantities week)
    {
        return new WeeklyQuantitiesDto
        {
            Monday = week.Monday,
            Tuesday = week.Tuesday,
            Wednesday = week.Wednesday,
            Thursday = week.Thursday,
            Friday = week.Friday,
            Saturday = week.Saturday,
            Sunday = week.Sunday
        };
    }
    
    public static void UpdateRequisition(
        FeRequisition requisition,
        SaveFeRequisitionDto dto,
        VanDriverLookupDto driver,
        Shop shop,
        IReadOnlyDictionary<Guid, FeTaskType> taskTypes)
    {
        requisition.RequisitionDate = dto.RequisitionDate;
        
        requisition.VanDriverId = driver.Id;
        requisition.VanDriverCode = driver.Code;
        requisition.VanDriverName = dto.VanDriverName.Trim();
        requisition.TradersName = driver.TradersName;

        requisition.ShopId = shop.Id;
        requisition.ShopCode = shop.Code;
        requisition.ShopName = shop.Name;

        requisition.IsVatApplicable = driver.HasVat;
        
        requisition.FeGeneralTasks.Clear();

        foreach (var task in dto.FeGeneralTasks)
        {
            requisition.FeGeneralTasks.Add(
                MapGeneralTask(task, taskTypes));
        }
        requisition.RecalculateSubtotal();
    }
    
    
}
