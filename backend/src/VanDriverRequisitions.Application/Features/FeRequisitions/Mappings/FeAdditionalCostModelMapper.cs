using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;

public static class FeAdditionalCostModelMapper
{
    public static FeAdditionalCostUpdateModel ToUpdateModel(
        SaveFeAdditionalCostDto dto,
        FeReason reason)
    {
        return new FeAdditionalCostUpdateModel(
            dto.Id,
            dto.WeekEndingDate,
            reason.Id,
            reason.Reason,
            dto.ChargingOption,
            dto.TotalNumber,
            dto.RatePerJob,
            dto.Miles,
            dto.RatePerMile);
    }
}