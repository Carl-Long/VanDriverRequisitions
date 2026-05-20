using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public class FeRequisitionService(
    IApplicationDbContext context,
    ICurrentUserService currentUser) : IFeRequisitionService
{
    public async Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(
        FeRequisitionQueryDto query,
        CancellationToken cancellationToken = default)
    {
        IQueryable<FeRequisition> dbQuery = context.Requisitions;

        // Filter: created by current user
        if (query.CreatedByMe)
        {
            var userId = currentUser.User.Id;
            dbQuery = dbQuery.Where(x => x.CreatedById == userId);
        }

        // Filter: requisition number search (contains, case-insensitive)
        if (!string.IsNullOrWhiteSpace(query.RequisitionNumber))
        {
            var search = query.RequisitionNumber.Trim();
            dbQuery = dbQuery.Where(x => x.RequisitionNumber.Contains(search));
        }

        // Filter: status
        if (!string.IsNullOrWhiteSpace(query.Status)
            && Enum.TryParse<RequisitionStatus>(query.Status, ignoreCase: true, out var statusEnum))
        {
            dbQuery = dbQuery.Where(x => x.Status == statusEnum);
        }

        // Filter: shop
        if (query.ShopId.HasValue)
        {
            dbQuery = dbQuery.Where(x => x.ShopId == query.ShopId.Value);
        }

        var totalCount = await dbQuery.CountAsync(cancellationToken);

        var items = await dbQuery
            .OrderByDescending(x => x.RequisitionDate)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(FeRequisitionProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<FeRequisitionSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }
}
