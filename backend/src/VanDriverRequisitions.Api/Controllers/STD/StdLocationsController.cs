using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VanDriverRequisitions.Api.Extensions;
using VanDriverRequisitions.Api.RateLimiting;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;
using VanDriverRequisitions.Application.Features.StdLocations.Services;

namespace VanDriverRequisitions.Api.Controllers.STD;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/std-locations")]
[Authorize]
public class StdLocationsController(IStdLocationService stdLocationService) : ControllerBase
{
    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(PagedResult<StdLocationSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<StdLocationSummaryDto>>> GetAll([FromQuery] StdLocationAdminQueryDto query, CancellationToken cancellationToken)
    {
        var result = await stdLocationService.GetAllAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("lookups")]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(List<StdLocationLookupDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<List<StdLocationLookupDto>>> GetActiveLookups([FromQuery] StdLocationLookupQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await stdLocationService.GetActiveLookupsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(StdLocationSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StdLocationSummaryDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await stdLocationService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(typeof(StdLocationSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<StdLocationSummaryDto>> Create(
        [FromBody] CreateStdLocationDto dto,
        CancellationToken cancellationToken)
    {
        var created = await stdLocationService.CreateAsync(dto, cancellationToken);
        return this.CreatedAtVersionedAction(nameof(GetById), created.Id, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(typeof(StdLocationSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<StdLocationSummaryDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateStdLocationDto updateStdLocationDto,
        CancellationToken cancellationToken)
    {
        var updated = await stdLocationService.UpdateAsync(id, updateStdLocationDto, cancellationToken);
        return Ok(updated);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await stdLocationService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await stdLocationService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}