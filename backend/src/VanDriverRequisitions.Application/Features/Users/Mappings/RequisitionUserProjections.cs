using System.Linq.Expressions;
using VanDriverRequisitions.Application.Features.Users.Dtos;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.Users.Mappings;

public static class RequisitionUserProjections
{
    public static Expression<Func<FeRequisition, RequisitionUserLookupDto>> AsLookupDto =>
        x => new RequisitionUserLookupDto
        {
            Id = x.CreatedById,
            Name = x.CreatedByNameSnapshot,
        };
}