using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

namespace VanDriverRequisitions.Api.Controllers.FE;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/fe-task-types")]
[Authorize]
public class FeTaskTypesController(
    IFeTaskTypeService feTaskTypeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FeTaskTypeSummaryDto>>> GetAll([FromQuery] bool includeInactive, CancellationToken cancellationToken)
    {
        var feTaskTypes = await feTaskTypeService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(feTaskTypes);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FeTaskTypeSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FeTaskTypeSummaryDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var feTaskType = await feTaskTypeService.GetByIdAsync(id, cancellationToken);
        return Ok(feTaskType);
    }
    
    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(FeTaskTypeSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FeTaskTypeSummaryDto>> Create([FromBody] CreateFeTaskTypeDto createFeTaskTypeDto, CancellationToken cancellationToken)
    {
        var createdFeTaskType = await feTaskTypeService.CreateAsync(createFeTaskTypeDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = createdFeTaskType.Id }, createdFeTaskType);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(FeTaskTypeSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FeTaskTypeSummaryDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateFeTaskTypeDto updateFeTaskTypeDto,
        CancellationToken cancellationToken)
    {
        var updatedFeTaskType = await feTaskTypeService.UpdateAsync(id, updateFeTaskTypeDto, cancellationToken);
        return Ok(updatedFeTaskType);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await feTaskTypeService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await feTaskTypeService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}