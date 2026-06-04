using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Services;

public interface IFeRequisitionService
{
    Task<PagedResult<FeRequisitionSummaryDto>> GetAllAsync(FeRequisitionQueryDto query, CancellationToken cancellationToken = default);
     Task<FeRequisitionDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FeRequisitionDetailDto> CreateAsync(SaveFeRequisitionDto dto, CancellationToken cancellationToken = default);
    Task<FeRequisitionDetailDto> UpdateAsync(Guid id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default);
    Task<FeRequisitionDetailDto> SubmitAsync(Guid? id, SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken = default);
    Task<FeRequisitionDetailDto> ApproveAsync(Guid id, ApproveFeRequisitionDto approveFeRequisitionDto, CancellationToken cancellationToken = default);
    Task<FeRequisitionDetailDto> RejectAsync(Guid id, RejectFeRequisitionDto rejectFeRequisitionDto, CancellationToken cancellationToken = default);
}