using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
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
    [Authorize(Policy = Policies.UserOnly)]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.CreateAsync(saveFeRequisitionDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id, version = "1.0", }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.UserOnly)]
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

    [HttpPost("submit")]
    [Authorize(Policy = Policies.UserOnly)]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitNew([FromBody] SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.SubmitAsync(null, saveFeRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/submit")]
    [Authorize(Policy = Policies.UserOnly)]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitExisting(Guid id, [FromBody] SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.SubmitAsync(id, saveFeRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpGet("submissions/{submissionId:guid}")]
    [ProducesResponseType(typeof(FeRequisitionSubmissionDetailDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSubmission(Guid submissionId, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.GetSubmissionAsync(submissionId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = Policies.ApproverOnly)]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveFeRequisitionDto approveFeRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.ApproveAsync(id, approveFeRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = Policies.ApproverOnly)]
    [ProducesResponseType(typeof(FeRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectFeRequisitionDto rejectFeRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await feRequisitionService.RejectAsync(id, rejectFeRequisitionDto, cancellationToken);
        return Ok(result);
    }
}