using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Services;

namespace VanDriverRequisitions.Api.Controllers.FE;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/fe-requisitions")]
[Authorize]
public class FeRequisitionsController(IFeRequisitionService feRequisitionService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] FeRequisitionQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await feRequisitionService.GetAllAsync(query, cancellationToken);
        return Ok(result);
    }
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.CreateAsync(saveFeRequisitionDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id, version = "1.0", }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
    [FromRoute] Guid id,
    [FromBody] SaveFeRequisitionDto saveFeRequisitionDto,
    CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.UpdateAsync(id, saveFeRequisitionDto, cancellationToken);
        return Ok(result);
    }
}