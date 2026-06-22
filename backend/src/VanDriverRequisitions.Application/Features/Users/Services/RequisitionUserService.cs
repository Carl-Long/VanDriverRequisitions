using Microsoft.EntityFrameworkCore;

using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.Users.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.Users.Services;

public class RequisitionUserService(IApplicationDbContext context, ICurrentUserService currentUserService, IValidatorService validator) : IRequisitionUserService
{
    public async Task<PagedResult<RequisitionUserLookupDto>> SearchAsync(RequisitionUserSearchQueryDto query, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        var userId = currentUserService.User?.Id ?? throw new UnauthorizedAccessException();

        var usersQuery = query.Fascia switch
        {
            Fascia.Fe => context.FeRequisitions
                .AsNoTracking()
                .Where(x => x.CreatedById != userId)
                .GroupBy(x => new
                {
                    x.CreatedById,
                    x.CreatedByNameSnapshot
                })
                .Select(x => new RequisitionUserLookupDto
                {
                    Id = x.Key.CreatedById,
                    Name = x.Key.CreatedByNameSnapshot
                }),

            Fascia.Std => context.StdRequisitions
                .AsNoTracking()
                .Where(x => x.CreatedById != userId)
                .GroupBy(x => new
                {
                    x.CreatedById,
                    x.CreatedByNameSnapshot
                })
                .Select(x => new RequisitionUserLookupDto
                {
                    Id = x.Key.CreatedById,
                    Name = x.Key.CreatedByNameSnapshot
                }),

            _ => throw new InvalidOperationException("Unsupported requisition fascia.")
        };

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            usersQuery = usersQuery.Where(x => x.Name.Contains(term));
        }

        var totalCount = await usersQuery.CountAsync(cancellationToken);

        var items = await usersQuery
            .OrderBy(x => x.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<RequisitionUserLookupDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }
}