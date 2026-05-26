using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public interface IFeRequisitionService
{
    Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(FeRequisitionQueryDto query, CancellationToken cancellationToken = default);

}