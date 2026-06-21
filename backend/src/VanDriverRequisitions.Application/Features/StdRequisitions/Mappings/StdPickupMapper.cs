using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdPickupMapper
{
    public static StdPickupUpdateModel ToUpdateModel(SaveStdPickupDto dto)
    {
        ArgumentNullException.ThrowIfNull(dto);

        return new StdPickupUpdateModel(
            dto.Id,
            dto.Date,
            dto.NumberOfBags,
            dto.NumberOfHouseholds,
            dto.ChargeType,
            dto.Miles,
            dto.RatePerMile,
            dto.FlatCharge);
    }

    public static StdPickupDetailDto ToDetailDto(StdPickup row)
    {
        ArgumentNullException.ThrowIfNull(row);

        return new StdPickupDetailDto
        {
            Id = row.Id,
            Date = row.Date,
            NumberOfBags = row.NumberOfBags,
            NumberOfHouseholds = row.NumberOfHouseholds,
            ChargeType = row.ChargeType,
            Miles = row.Miles,
            RatePerMile = row.RatePerMile,
            FlatCharge = row.FlatCharge,
            TotalValue = row.TotalValue ?? 0m,
        };
    }
}