using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeAdditionalCostMapper
{
    public static FeAdditionalCostUpdateModel ToUpdateModel(SaveFeAdditionalCostDto saveFeAdditionalCostDto, FeReason reason)
    {
        return new FeAdditionalCostUpdateModel(
            saveFeAdditionalCostDto.Id,
            saveFeAdditionalCostDto.WeekEndingDate,
            reason.Id,
            reason.Reason,
            saveFeAdditionalCostDto.ChargingOption,
            saveFeAdditionalCostDto.TotalNumber,
            saveFeAdditionalCostDto.RatePerJob,
            saveFeAdditionalCostDto.Miles,
            saveFeAdditionalCostDto.RatePerMile);
    }
    
    public static FeAdditionalCostDetailDto ToDetailDto(FeAdditionalCost cost)
    {
        return new FeAdditionalCostDetailDto
        {
            Id = cost.Id,
            WeekEndingDate = cost.WeekEndingDate,

            ReasonId = cost.ReasonId,
            ReasonText = cost.ReasonText,

            ChargingOption = cost.ChargingOption,

            TotalNumber = cost.TotalNumber,
            RatePerJob = cost.RatePerJob,

            Miles = cost.Miles,
            RatePerMile = cost.RatePerMile,

            TotalValue = cost.TotalValue
        };
    }
}


