using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VanDriverRequisitions.Api.RateLimiting;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.CostReasons.Dtos;
using VanDriverRequisitions.Application.Features.CostReasons.Services;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Api.Controllers.Common;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/cost-reasons")]
[Authorize]
public class CostReasonsController(ICostReasonService costReasonService) : ControllerBase
{
    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(List<CostReasonSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CostReasonSummaryDto>>> GetAll([FromQuery] bool includeInactive, CancellationToken cancellationToken) 
    {
        var costReasons = await costReasonService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(costReasons);
    }

    [HttpGet("lookups")]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(List<CostReasonLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CostReasonLookupDto>>> GetActiveLookups([FromQuery] Fascia fascia, CancellationToken cancellationToken)
    {
        var costReasons = await costReasonService.GetActiveLookupsAsync(fascia, cancellationToken);
        return Ok(costReasons);
    }

    [HttpGet("{id:guid}")]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(CostReasonSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CostReasonSummaryDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var costReason = await costReasonService.GetByIdAsync(id, cancellationToken);
        return Ok(costReason);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(CostReasonSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CostReasonSummaryDto>> Create([FromBody] CreateCostReasonDto createCostReasonDto, CancellationToken cancellationToken)
    {
        var createdCostReason = await costReasonService.CreateAsync(createCostReasonDto, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = createdCostReason.Id },
            createdCostReason);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(typeof(CostReasonSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CostReasonSummaryDto>> Update([FromRoute] Guid id, [FromBody] UpdateCostReasonDto updateCostReasonDto, CancellationToken cancellationToken)
    {
        var updatedCostReason = await costReasonService.UpdateAsync(id, updateCostReasonDto, cancellationToken);
        return Ok(updatedCostReason);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await costReasonService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await costReasonService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}