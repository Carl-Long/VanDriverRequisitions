using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Application.Features.StdLocations.Services;

namespace VanDriverRequisitions.Api.Controllers.STD;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/std-locations")]
[Authorize]
public class StdLocationsController(IStdLocationService stdLocationService) : ControllerBase
{
    [HttpGet("lookups")]
    [ProducesResponseType(typeof(List<StdLocationLookupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetActiveLookups([FromQuery] StdLocationLookupQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await stdLocationService.GetActiveLookupsAsync(query, cancellationToken);
        return Ok(result);
    }
}