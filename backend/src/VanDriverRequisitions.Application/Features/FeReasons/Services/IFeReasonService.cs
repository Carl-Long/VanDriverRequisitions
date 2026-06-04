using VanDriverRequisitions.Application.Features.FeReasons.Dtos;

namespace VanDriverRequisitions.Application.Features.FeReasons.Services;

public interface IFeReasonService
{
    Task<List<FeReasonSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<FeReasonSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FeReasonSummaryDto> CreateAsync(CreateFeReasonDto dto, CancellationToken cancellationToken = default);
    Task<FeReasonSummaryDto> UpdateAsync(Guid id, UpdateFeReasonDto dto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
