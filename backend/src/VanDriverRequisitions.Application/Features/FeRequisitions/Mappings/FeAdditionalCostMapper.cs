using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeAdditionalCostMapper
{
    public static FeAdditionalCostUpdateModel ToUpdateModel(SaveFeAdditionalCostDto saveFeAdditionalCostDto, CostReason reason)
    {
        return new FeAdditionalCostUpdateModel(
            saveFeAdditionalCostDto.Id,
            saveFeAdditionalCostDto.WeekEndingDate,
            reason.Id,
            reason.Code,
            reason.Reason,
            saveFeAdditionalCostDto.ChargingOption,
            saveFeAdditionalCostDto.TotalNumber,
            saveFeAdditionalCostDto.RatePerJob,
            saveFeAdditionalCostDto.Miles,
            saveFeAdditionalCostDto.RatePerMile);
    }

    public static FeAdditionalCostDetailDto ToDetailDto(FeAdditionalCost cost, bool isReasonActive)
    {
        return new FeAdditionalCostDetailDto
        {
            Id = cost.Id,
            WeekEndingDate = cost.WeekEndingDate,

            ReasonId = cost.ReasonId,
            ReasonCode = cost.ReasonCodeSnapshot,
            ReasonText = cost.ReasonTextSnapshot,
            IsReasonActive = isReasonActive,

            ChargingOption = cost.ChargingOption,

            TotalNumber = cost.TotalNumber,
            RatePerJob = cost.RatePerJob,

            Miles = cost.Miles,
            RatePerMile = cost.RatePerMile,

            TotalValue = cost.TotalValue
        };
    }
}