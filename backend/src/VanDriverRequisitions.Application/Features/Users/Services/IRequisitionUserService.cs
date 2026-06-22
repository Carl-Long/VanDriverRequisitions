using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.Users.Dtos;

namespace VanDriverRequisitions.Application.Features.Users.Services;

public interface IRequisitionUserService
{
    Task<PagedResult<RequisitionUserLookupDto>> SearchAsync(RequisitionUserSearchQueryDto query, CancellationToken cancellationToken = default);
}