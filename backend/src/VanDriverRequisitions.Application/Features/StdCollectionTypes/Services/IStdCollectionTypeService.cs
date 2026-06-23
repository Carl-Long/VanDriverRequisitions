using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;

public interface IStdCollectionTypeService
{
    Task<List<StdCollectionTypeSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<StdCollectionTypeSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<StdCollectionTypeLookupDto>> GetActiveLookupsAsync(CancellationToken cancellationToken = default);
    Task<StdCollectionTypeSummaryDto> CreateAsync(CreateStdCollectionTypeDto createStdCollectionTypeDto, CancellationToken cancellationToken = default);
    Task<StdCollectionTypeSummaryDto> UpdateAsync(Guid id, UpdateStdCollectionTypeDto updateStdCollectionTypeDto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}