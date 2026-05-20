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
public class FeRequisitionsController(
    IFeRequisitionService feRequisitionService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? requisitionNumber = null,
        [FromQuery] string? status = null,
        [FromQuery] Guid? shopId = null,
        [FromQuery] bool createdByMe = false,
        CancellationToken cancellationToken = default)
    {
        var query = new FeRequisitionQueryDto
        {
            Page = page,
            PageSize = pageSize,
            RequisitionNumber = requisitionNumber,
            Status = status,
            ShopId = shopId,
            CreatedByMe = createdByMe,
        };

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
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] SaveFeRequisitionDto dto,
        CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id, version = "1.0" }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] SaveFeRequisitionDto dto,
        CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.UpdateAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/submit")]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Submit([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.SubmitAsync(id, cancellationToken);
        return Ok(result);
    }
}
