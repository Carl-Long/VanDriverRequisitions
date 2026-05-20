using VanDriverRequisitions.Application.Features.LimitValues.Dtos;

namespace VanDriverRequisitions.Application.Features.LimitValues.Services;

public interface ILimitValueService
{
    Task<List<LimitValueDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<LimitValueDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<LimitValueDto> CreateAsync(CreateLimitValueDto dto, CancellationToken cancellationToken = default);
    Task<LimitValueDto> UpdateAsync(Guid id, UpdateLimitValueDto dto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
