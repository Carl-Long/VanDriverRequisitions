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
public class FeTaskTypesController(
    IFeTaskTypeService feTaskTypeService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<FeTaskTypeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<FeTaskTypeDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var data = await feTaskTypeService.GetAllAsync(cancellationToken);
        return Ok(data);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FeTaskTypeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FeTaskTypeDto>> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var data = await feTaskTypeService.GetByIdAsync(
            id,
            cancellationToken);

        return Ok(data);
    }

    // Admin view: includes inactive (bypasses global filter)
    [HttpGet("admin")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(List<FeTaskTypeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<List<FeTaskTypeDto>>> GetAllIncludingInactive(
        CancellationToken cancellationToken)
    {
        var data = await feTaskTypeService
            .GetAllIncludingInactiveAsync(cancellationToken);

        return Ok(data);
    }

    [HttpPost]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(FeTaskTypeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FeTaskTypeDto>> Create(
        [FromBody] CreateFeTaskTypeDto dto,
        CancellationToken cancellationToken)
    {
        var data = await feTaskTypeService.CreateAsync(
            dto,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                version = "1",
                id = data.Id
            },
            data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(typeof(FeTaskTypeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<FeTaskTypeDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateFeTaskTypeDto dto,
        CancellationToken cancellationToken)
    {
        var data = await feTaskTypeService.UpdateAsync(
            id,
            dto,
            cancellationToken);

        return Ok(data);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await feTaskTypeService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.AdminOnly)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        await feTaskTypeService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}