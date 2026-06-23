using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Services;

namespace VanDriverRequisitions.Api.Controllers.STD;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/std-requisitions")]
[Authorize]
public class StdRequisitionsController(IStdRequisitionService stdRequisitionService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] StdRequisitionQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await stdRequisitionService.GetAllAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanCreateRequisitions)]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.CreateAsync(saveStdRequisitionDto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id, version = "1.0" }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanCreateRequisitions)]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.UpdateAsync(id, saveStdRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("submit")]
    [Authorize(Policy = Policies.CanCreateRequisitions)]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitNew([FromBody] SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.SubmitAsync(null, saveStdRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/submit")]
    [Authorize(Policy = Policies.CanCreateRequisitions)]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitExisting([FromRoute] Guid id, [FromBody] SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.SubmitAsync(id, saveStdRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpGet("submissions/{submissionId:guid}")]
    [ProducesResponseType(typeof(StdRequisitionSubmissionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubmission([FromRoute] Guid submissionId, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.GetSubmissionAsync(submissionId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = Policies.CanApproveRequisitions)]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve([FromRoute] Guid id, [FromBody] ApproveStdRequisitionDto approveStdRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.ApproveAsync(id, approveStdRequisitionDto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = Policies.CanApproveRequisitions)]
    [ProducesResponseType(typeof(StdRequisitionDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reject([FromRoute] Guid id, [FromBody] RejectStdRequisitionDto rejectStdRequisitionDto, CancellationToken cancellationToken)
    {
        var result = await stdRequisitionService.RejectAsync(id, rejectStdRequisitionDto, cancellationToken);
        return Ok(result);
    }
}