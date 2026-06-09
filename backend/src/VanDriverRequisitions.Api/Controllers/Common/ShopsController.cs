using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Features.Shops.Services;

namespace VanDriverRequisitions.Api.Controllers.Common;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/shops")]
[Authorize]
public class ShopsController(IShopService shopService) : ControllerBase
{
    [HttpGet("lookups")]
    public async Task<IActionResult> GetActiveLookups(CancellationToken cancellationToken = default)
    {
        var result = await shopService.GetActiveLookupsAsync(cancellationToken);
        return Ok(result);
    }
}
