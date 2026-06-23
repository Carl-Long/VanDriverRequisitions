using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Mappings;

public static class StdCollectionVanPackMapper
{
    public static StdCollectionVanPackUpdateModel ToUpdateModel(
        SaveStdCollectionVanPackDto dto,
        decimal ratePerVanPack)
    {
        ArgumentNullException.ThrowIfNull(dto);

        return new StdCollectionVanPackUpdateModel(
            dto.Id,
            dto.DeliveryDate,
            dto.PostCodeZone,
            dto.VanPacksOut,
            dto.FilledBags,
            ratePerVanPack);
    }

    public static StdCollectionVanPackDetailDto ToDetailDto(StdCollectionVanPack row)
    {
        ArgumentNullException.ThrowIfNull(row);

        return new StdCollectionVanPackDetailDto
        {
            Id = row.Id,
            DeliveryDate = row.DeliveryDate,
            PostCodeZone = row.PostCodeZone,
            VanPacksOut = row.VanPacksOut,
            FilledBags = row.FilledBags,
            UnusedVanPacks = row.UnusedVanPacks,
            PercentReturned = row.PercentReturned,
            RatePerVanPack = row.RatePerVanPack,
            TotalValue = row.TotalValue ?? 0m,
        };
    }
}