using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Services;

public interface IStdRequisitionService
{
    Task<PagedResult<StdRequisitionSummaryDto>> GetAllAsync(StdRequisitionQueryDto query, CancellationToken cancellationToken = default);
    Task<StdRequisitionDetailDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<StdRequisitionDetailDto> CreateAsync(SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken = default);
    Task<StdRequisitionDetailDto> UpdateAsync(Guid id, SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken = default);
}