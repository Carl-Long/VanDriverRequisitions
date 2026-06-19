using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;

namespace VanDriverRequisitions.Api.Controllers.STD;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/std-collection-types")]
[Authorize]
public class StdCollectionTypesController(
    IStdCollectionTypeService stdCollectionTypeService) : ControllerBase
{
    [HttpGet("lookups")]
    [ProducesResponseType(typeof(List<StdCollectionTypeLookupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveLookups(CancellationToken cancellationToken = default)
    {
        var result = await stdCollectionTypeService.GetActiveLookupsAsync(cancellationToken);
        return Ok(result);
    }
}