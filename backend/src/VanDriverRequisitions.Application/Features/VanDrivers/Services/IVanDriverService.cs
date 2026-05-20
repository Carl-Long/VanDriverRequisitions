using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

namespace VanDriverRequisitions.Application.Features.VanDrivers.Services;

public interface IVanDriverService
{
    Task<PagedResult<VanDriverLookupDto>> SearchAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<VanDriverLookupDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
