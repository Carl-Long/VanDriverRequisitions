using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;

namespace VanDriverRequisitions.Api.Controllers.STD;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/std-collection-types")]
[Authorize]
public class StdCollectionTypesController(IStdCollectionTypeService stdCollectionTypeService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<StdCollectionTypeSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<StdCollectionTypeSummaryDto>>> GetAll([FromQuery] bool includeInactive, CancellationToken cancellationToken)
    {
        var result = await stdCollectionTypeService.GetAllAsync(includeInactive, cancellationToken);
        return Ok(result);
    }

    [HttpGet("lookups")]
    [ProducesResponseType(typeof(List<StdCollectionTypeLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<StdCollectionTypeLookupDto>>> GetActiveLookups(CancellationToken cancellationToken = default)
    {
        var result = await stdCollectionTypeService.GetActiveLookupsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StdCollectionTypeSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<StdCollectionTypeSummaryDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await stdCollectionTypeService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [ProducesResponseType(typeof(StdCollectionTypeSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<StdCollectionTypeSummaryDto>> Create([FromBody] CreateStdCollectionTypeDto createStdCollectionTypeDto, CancellationToken cancellationToken)
    {
        var created = await stdCollectionTypeService.CreateAsync(createStdCollectionTypeDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [ProducesResponseType(typeof(StdCollectionTypeSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<StdCollectionTypeSummaryDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateStdCollectionTypeDto updateStdCollectionTypeDto,
        CancellationToken cancellationToken)
    {
        var updated = await stdCollectionTypeService.UpdateAsync(id, updateStdCollectionTypeDto, cancellationToken);
        return Ok(updated);
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await stdCollectionTypeService.ActivateAsync(id, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Deactivate([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await stdCollectionTypeService.DeactivateAsync(id, cancellationToken);
        return NoContent();
    }
}