using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Extensions;

public static class StdRequisitionQueryExtensions
{
    public static IQueryable<StdRequisition> ApplyFilters(this IQueryable<StdRequisition> query, StdRequisitionQueryDto filters)
    {
        if (filters.CreatedByUserId.HasValue)
        {
            query = query.Where(x => x.CreatedById == filters.CreatedByUserId);
        }

        if (!string.IsNullOrWhiteSpace(filters.RequisitionNumber))
        {
            var search = filters.RequisitionNumber.Trim();

            query = query.Where(x => x.RequisitionNumber.Contains(search));
        }

        if (filters.Status is not null)
        {
            query = query.Where(x => x.Status == filters.Status);
        }

        if (filters.ShopId.HasValue)
        {
            query = query.Where(x => x.ShopId == filters.ShopId.Value);
        }

        return query;
    }
}