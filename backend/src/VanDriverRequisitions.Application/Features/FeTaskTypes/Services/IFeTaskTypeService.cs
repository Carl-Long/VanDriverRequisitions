using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

public interface IFeTaskTypeService
{
    Task<List<FeTaskTypeSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<FeTaskTypeSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FeTaskTypeSummaryDto> CreateAsync(CreateFeTaskTypeDto dto, CancellationToken cancellationToken = default);
    Task<FeTaskTypeSummaryDto> UpdateAsync(Guid id, UpdateFeTaskTypeDto dto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}