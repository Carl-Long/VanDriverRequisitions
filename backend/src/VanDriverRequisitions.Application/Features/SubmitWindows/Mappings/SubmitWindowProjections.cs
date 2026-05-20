using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Mappings;

public static class SubmitWindowProjections
{
    public static Expression<Func<SubmitWindow, SubmitWindowDto>> AsSummaryDto =>
        x => new SubmitWindowDto
        {
            Id = x.Id,
            OpenFrom = x.OpenFrom,
            OpenTo = x.OpenTo,
            IsDeleted = x.DeletedAtUtc != null,
            CreatedAtUtc = x.CreatedAtUtc,
            CreatedByNameSnapshot = x.CreatedByNameSnapshot,
            UpdatedAtUtc = x.UpdatedAtUtc,
            UpdatedByNameSnapshot = x.UpdatedByNameSnapshot
        };
}
