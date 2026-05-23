using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Services;

public interface ISubmitWindowService
{
    Task<PagedResult<SubmitWindowSummaryDto>> GetAllAsync(int page, int pageSize, SubmitWindowFilter submitWindowFilter, CancellationToken cancellationToken = default);
    Task<SubmitWindowSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubmitWindowSummaryDto> CreateAsync(CreateSubmitWindowDto dto, CancellationToken cancellationToken = default);
    Task<SubmitWindowSummaryDto> UpdateAsync(Guid id, UpdateSubmitWindowDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubmitWindowStatusDto> GetStatusAsync(CancellationToken cancellationToken = default);
}
