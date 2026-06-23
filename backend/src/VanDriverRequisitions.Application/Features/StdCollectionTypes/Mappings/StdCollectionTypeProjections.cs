using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Mappings;

public static class StdCollectionTypeProjections
{
    public static Expression<Func<StdCollectionType, StdCollectionTypeSummaryDto>> AsSummaryDto =>
        x => new StdCollectionTypeSummaryDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            IsActive = x.IsActive,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };

    public static Expression<Func<StdCollectionType, StdCollectionTypeLookupDto>> AsLookupDto =>
        x => new StdCollectionTypeLookupDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name
        };
}