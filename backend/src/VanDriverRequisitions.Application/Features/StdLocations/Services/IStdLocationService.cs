using VanDriverRequisitions.Application.Features.StdLocations.Dtos;

namespace VanDriverRequisitions.Application.Features.StdLocations.Services;

public interface IStdLocationService
{
    Task<List<StdLocationLookupDto>> GetActiveLookupsAsync(StdLocationLookupQueryDto query, CancellationToken cancellationToken = default);
}