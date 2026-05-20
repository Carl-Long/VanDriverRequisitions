using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.LimitValues.Dtos;
using VanDriverRequisitions.Application.Features.LimitValues.Services;

namespace VanDriverRequisitions.Api.Controllers.Common;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/limit-values")]
[Authorize]
public class LimitValuesController(ILimitValueService limitValueService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LimitValueDto>>> GetAll([FromQuery] bool includeInactive, CancellationToken cancellationToken)
    {
        var limitValues = await limitValueService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(limitValues);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LimitValueDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LimitValueDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var limitValue = await limitValueService.GetByIdAsync(id, cancellationToken);
        return Ok(limitValue);
    }

    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(LimitValueDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LimitValueDto>> Create([FromBody] CreateLimitValueDto createLimitValueDto, CancellationToken cancellationToken)
    {
        var created = await limitValueService.CreateAsync(createLimitValueDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(LimitValueDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<LimitValueDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateLimitValueDto updateLimitValueDto,
        CancellationToken cancellationToken)
    {
        var updated = await limitValueService.UpdateAsync(id, updateLimitValueDto, cancellationToken);
        return Ok(updated);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await limitValueService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await limitValueService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}
