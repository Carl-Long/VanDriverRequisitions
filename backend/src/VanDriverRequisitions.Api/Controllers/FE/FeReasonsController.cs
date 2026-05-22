using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.FeReasons.Dtos;
using VanDriverRequisitions.Application.Features.FeReasons.Services;

namespace VanDriverRequisitions.Api.Controllers.FE;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/fe-reasons")]
[Authorize]
public class FeReasonsController(
    IFeReasonService feReasonService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FeReasonSummaryDto>>> GetAll([FromQuery] bool includeInactive, CancellationToken cancellationToken)
    {
        var feReasons = await feReasonService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(feReasons);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FeReasonSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FeReasonSummaryDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var feReason = await feReasonService.GetByIdAsync(id, cancellationToken);
        return Ok(feReason);
    }

    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(FeReasonSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FeReasonSummaryDto>> Create([FromBody] CreateFeReasonDto createFeReasonDto, CancellationToken cancellationToken)
    {
        var createdFeReason = await feReasonService.CreateAsync(createFeReasonDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdFeReason.Id }, createdFeReason);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(FeReasonSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FeReasonSummaryDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateFeReasonDto updateFeReasonDto,
        CancellationToken cancellationToken)
    {
        var updatedFeReason = await feReasonService.UpdateAsync(id, updateFeReasonDto, cancellationToken);
        return Ok(updatedFeReason);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await feReasonService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await feReasonService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}
