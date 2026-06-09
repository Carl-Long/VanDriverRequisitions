using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeGeneralTaskModelMapper
{
    public static FeGeneralTaskUpdateModel ToUpdateModel(SaveFeGeneralTaskDto saveFeGeneralTaskDto, FeTaskType taskType)
    {
        return new FeGeneralTaskUpdateModel(
            saveFeGeneralTaskDto.Id,
            saveFeGeneralTaskDto.FeTaskTypeId,
            taskType.Name,
            taskType.Code,
            saveFeGeneralTaskDto.WeekEndingDate,
            new WeeklyQuantities(
                saveFeGeneralTaskDto.Week.Sunday,
                saveFeGeneralTaskDto.Week.Monday,
                saveFeGeneralTaskDto.Week.Tuesday,
                saveFeGeneralTaskDto.Week.Wednesday,
                saveFeGeneralTaskDto.Week.Thursday,
                saveFeGeneralTaskDto.Week.Friday,
                saveFeGeneralTaskDto.Week.Saturday),
            saveFeGeneralTaskDto.RatePerJob);
    }
}