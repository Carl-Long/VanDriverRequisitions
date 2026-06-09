using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Features.Shops.Dtos;

namespace VanDriverRequisitions.Application.Features.Shops.Services;

public interface IShopService
{
    Task<List<ShopLookupDto>> GetActiveLookupsAsync(CancellationToken cancellationToken = default);
}
