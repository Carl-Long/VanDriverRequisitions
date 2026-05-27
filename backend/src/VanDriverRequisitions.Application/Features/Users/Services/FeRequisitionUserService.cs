using Microsoft.EntityFrameworkCore;

using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.Users.Dtos;
using VanDriverRequisitions.Application.Features.Users.Mappings;

namespace VanDriverRequisitions.Application.Features.Users.Services;

public class FeRequisitionUserService(IApplicationDbContext context ) : IFeRequisitionUserService
{
    public async Task<PagedResult<RequisitionUserLookupDto>> SearchAsync(RequisitionUserSearchQueryDto query, CancellationToken cancellationToken = default)
    {
        var usersQuery = context.FeRequisitions
            .Select(RequisitionUserProjections.AsLookupDto)
            .Distinct();

        if (!string.IsNullOrWhiteSpace(
                query.Search))
        {
            var term = query.Search.Trim();
            usersQuery = usersQuery.Where(x =>
                x.Name.Contains(term));
        }

        var totalCount = await usersQuery.CountAsync(cancellationToken);

        var items = await usersQuery
            .OrderBy(x => x.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<
            RequisitionUserLookupDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }
}