using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;

public interface IStdCollectionTypeService
{
    Task<List<StdCollectionTypeLookupDto>> GetActiveLookupsAsync(CancellationToken cancellationToken = default);
}