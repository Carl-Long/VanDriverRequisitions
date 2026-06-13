using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeGeneralTaskMapper
{
    public static FeGeneralTaskUpdateModel ToUpdateModel(SaveFeGeneralTaskDto saveFeGeneralTaskDto, FeTaskType taskType)
    {
        return new FeGeneralTaskUpdateModel(
            saveFeGeneralTaskDto.Id,
            saveFeGeneralTaskDto.FeTaskTypeId,
            taskType.Name,
            taskType.Code,
            saveFeGeneralTaskDto.WeekEndingDate,
            WeeklyQuantitiesMapper.ToValueObject(saveFeGeneralTaskDto.Week),
            saveFeGeneralTaskDto.RatePerJob);
    }
    
    public static FeGeneralTaskDetailDto ToDetailDto(FeGeneralTask task)
    {
        return new FeGeneralTaskDetailDto
        {
            Id = task.Id,
            FeTaskTypeId = task.FeTaskTypeId,
            TaskTypeName = task.TaskTypeName,
            TaskTypeCode = task.TaskTypeCode,
            WeekEndingDate = task.WeekEndingDate,
            Week = WeeklyQuantitiesMapper.ToDto(task.Week),
            TotalNumber = task.TotalNumber,
            RatePerJob = task.RatePerJob,
            TotalValue = task.TotalValue
        };
    }
}

   
