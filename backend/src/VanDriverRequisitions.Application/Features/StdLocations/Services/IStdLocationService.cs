using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;

namespace VanDriverRequisitions.Application.Features.StdLocations.Services;

public interface IStdLocationService
{
    Task<PagedResult<StdLocationSummaryDto>> GetAllAsync(StdLocationAdminQueryDto query, CancellationToken cancellationToken = default);
    Task<StdLocationSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<StdLocationLookupDto>> GetActiveLookupsAsync(StdLocationLookupQueryDto query, CancellationToken cancellationToken = default);
    Task<StdLocationSummaryDto> CreateAsync(CreateStdLocationDto createStdLocationDto, CancellationToken cancellationToken = default);
    Task<StdLocationSummaryDto> UpdateAsync(Guid id, UpdateStdLocationDto updateStdLocationDto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}