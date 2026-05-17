using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

public interface IFeTaskTypeService
{
    Task<List<FeTaskTypeDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<FeTaskTypeDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<FeTaskTypeDto>> GetAllIncludingInactiveAsync(CancellationToken cancellationToken = default);
    Task<FeTaskTypeDto> CreateAsync(CreateFeTaskTypeDto dto, CancellationToken cancellationToken = default);
    Task<FeTaskTypeDto> UpdateAsync(Guid id, UpdateFeTaskTypeDto dto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}