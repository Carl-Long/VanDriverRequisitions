using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Extensions;

public static class FeRequisitionQueryExtensions
{
    public static IQueryable<FeRequisition> ApplyFilters(
        this IQueryable<FeRequisition> query,
        FeRequisitionQueryDto filters,
        Guid currentUserId)
    {
        if (filters.CreatedByMe)
        {
            query = query.Where(x => x.CreatedById == currentUserId);
        }

        if (!string.IsNullOrWhiteSpace(filters.RequisitionNumber))
        {
            var search = filters.RequisitionNumber.Trim();

            query = query.Where(x =>
                x.RequisitionNumber.Contains(search));
        }

        if (filters.Status is not null)
        {
            query = query.Where(x => x.Status == filters.Status);
        }

        if (filters.ShopId.HasValue)
        {
            query = query.Where(x =>
                x.ShopId == filters.ShopId.Value);
        }

        return query;
    }
}