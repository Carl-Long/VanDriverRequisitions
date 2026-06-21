using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdAdditionalCostMapper
{
    public static StdAdditionalCostUpdateModel ToUpdateModel(
        SaveStdAdditionalCostDto dto,
        FeReason reason)
    {
        ArgumentNullException.ThrowIfNull(dto);
        ArgumentNullException.ThrowIfNull(reason);

        return new StdAdditionalCostUpdateModel(
            dto.Id,
            dto.Date,
            reason.Id,
            reason.Reason,
            dto.NumberOfBags,
            dto.ChargeType,
            dto.Miles,
            dto.RatePerMile,
            dto.FlatCharge);
    }

    public static StdAdditionalCostDetailDto ToDetailDto(StdAdditionalCost row)
    {
        ArgumentNullException.ThrowIfNull(row);

        return new StdAdditionalCostDetailDto
        {
            Id = row.Id,
            Date = row.Date,

            ReasonId = row.ReasonId,
            ReasonName = row.ReasonNameSnapshot,

            NumberOfBags = row.NumberOfBags,

            ChargeType = row.ChargeType,
            Miles = row.Miles,
            RatePerMile = row.RatePerMile,
            FlatCharge = row.FlatCharge,

            TotalValue = row.TotalValue ?? 0m,
        };
    }
}