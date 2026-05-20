using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.Shops.Dtos;

namespace VanDriverRequisitions.Application.Features.Shops.Services;

public interface IShopService
{
    Task<PagedResult<ShopLookupDto>> SearchAsync(string? search, int page, int pageSize, CancellationToken cancellationToken = default);
}
