using VanDriverRequisitions.Application.Features.FeReasons.Dtos;

namespace VanDriverRequisitions.Application.Features.FeReasons.Services;

public interface IFeReasonService
{
    Task<List<FeReasonDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<FeReasonDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FeReasonDto> CreateAsync(CreateFeReasonDto dto, CancellationToken cancellationToken = default);
    Task<FeReasonDto> UpdateAsync(Guid id, UpdateFeReasonDto dto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
