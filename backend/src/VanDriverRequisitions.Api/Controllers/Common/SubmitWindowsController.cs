using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using VanDriverRequisitions.Api.Extensions;
using VanDriverRequisitions.Api.RateLimiting;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;
using VanDriverRequisitions.Application.Features.SubmitWindows.Services;

namespace VanDriverRequisitions.Api.Controllers.Common;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/submit-windows")]
[Authorize]
public class SubmitWindowsController(ISubmitWindowService submitWindowService) : ControllerBase
{
    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    public async Task<IActionResult> GetAll([FromQuery] SubmitWindowQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await submitWindowService.GetAllAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(SubmitWindowSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubmitWindowSummaryDto>> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var submitWindow = await submitWindowService.GetByIdAsync(id, cancellationToken);
        return Ok(submitWindow);
    }
    
    [HttpGet("status")]
    [EnableRateLimiting(RateLimitPolicies.Read)]
    [ProducesResponseType(typeof(SubmitWindowStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
    {
        var status = await submitWindowService.GetStatusAsync(cancellationToken);
        return Ok(status);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(typeof(SubmitWindowSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SubmitWindowSummaryDto>> Create([FromBody] CreateSubmitWindowDto createDto, CancellationToken cancellationToken)
    {
        var created = await submitWindowService.CreateAsync(createDto, cancellationToken);
        return this.CreatedAtVersionedAction(nameof(GetById), created.Id, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(typeof(SubmitWindowSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SubmitWindowSummaryDto>> Update([FromRoute] Guid id,
        [FromBody] UpdateSubmitWindowDto updateDto,
        CancellationToken cancellationToken)
    {
        var updated = await submitWindowService.UpdateAsync(id, updateDto, cancellationToken);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [EnableRateLimiting(RateLimitPolicies.Write)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        await submitWindowService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
