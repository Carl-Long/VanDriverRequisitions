using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Services;

public interface ISubmitWindowService
{
    Task<PagedResult<SubmitWindowDto>> GetAllAsync(int page, int pageSize, bool includeDeleted, CancellationToken cancellationToken = default);
    Task<SubmitWindowDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubmitWindowDto> CreateAsync(CreateSubmitWindowDto dto, CancellationToken cancellationToken = default);
    Task<SubmitWindowDto> UpdateAsync(Guid id, UpdateSubmitWindowDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task RestoreAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SubmitWindowStatusDto> GetStatusAsync(CancellationToken cancellationToken = default);
}
