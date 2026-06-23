using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdAdditionalCostMapper
{
    public static StdAdditionalCostUpdateModel ToUpdateModel(SaveStdAdditionalCostDto saveStdAdditionalCostDto, CostReason reason)
    {
        ArgumentNullException.ThrowIfNull(saveStdAdditionalCostDto);
        ArgumentNullException.ThrowIfNull(reason);

        return new StdAdditionalCostUpdateModel(
            saveStdAdditionalCostDto.Id,
            saveStdAdditionalCostDto.Date,
            reason.Id,
            reason.Code,
            reason.Reason,
            saveStdAdditionalCostDto.NumberOfBags,
            saveStdAdditionalCostDto.ChargeType,
            saveStdAdditionalCostDto.Miles,
            saveStdAdditionalCostDto.RatePerMile,
            saveStdAdditionalCostDto.FlatCharge);
    }

    public static StdAdditionalCostDetailDto ToDetailDto(StdAdditionalCost cost, bool isReasonActive)
    {
        ArgumentNullException.ThrowIfNull(cost);

        return new StdAdditionalCostDetailDto
        {
            Id = cost.Id,
            Date = cost.Date,

            ReasonId = cost.ReasonId,
            ReasonCode = cost.ReasonCodeSnapshot,
            ReasonText = cost.ReasonTextSnapshot,
            IsReasonActive = isReasonActive,

            NumberOfBags = cost.NumberOfBags,

            ChargeType = cost.ChargeType,
            Miles = cost.Miles,
            RatePerMile = cost.RatePerMile,
            FlatCharge = cost.FlatCharge,

            TotalValue = cost.TotalValue ?? 0m,
        };
    }
}