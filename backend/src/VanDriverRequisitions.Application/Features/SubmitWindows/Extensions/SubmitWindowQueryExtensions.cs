using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Extensions;

public static class SubmitWindowQueryExtensions
{
    public static IQueryable<SubmitWindow> OpenAt(this IQueryable<SubmitWindow> query, DateTime utcNow)
    {
        return query.Where(x => x.OpenFrom <= utcNow && x.OpenTo >= utcNow);
    }
}