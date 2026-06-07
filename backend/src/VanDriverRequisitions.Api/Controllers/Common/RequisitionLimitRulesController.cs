using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;

namespace VanDriverRequisitions.Api.Controllers.Common;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/requisition-limit-rules")]
[Authorize]
public class RequisitionLimitRulesController(
    IRequisitionLimitRuleService requisitionLimitRuleService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(List<RequisitionLimitRuleSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<RequisitionLimitRuleSummaryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var rules = await requisitionLimitRuleService.GetAllAsync(cancellationToken);
        return Ok(rules);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RequisitionLimitRuleSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RequisitionLimitRuleSummaryDto>> GetById(
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        var rule = await requisitionLimitRuleService.GetByIdAsync(id, cancellationToken);
        return Ok(rule);
    }

    [HttpPost]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [ProducesResponseType(typeof(RequisitionLimitRuleSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RequisitionLimitRuleSummaryDto>> Create(
        [FromBody] CreateRequisitionLimitRuleDto createDto,
        CancellationToken cancellationToken)
    {
        var created = await requisitionLimitRuleService.CreateAsync(createDto, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.CanManageConfiguration)]
    [ProducesResponseType(typeof(RequisitionLimitRuleSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<RequisitionLimitRuleSummaryDto>> Update(
        [FromRoute] Guid id,
        [FromBody] UpdateRequisitionLimitRuleDto updateDto,
        CancellationToken cancellationToken)
    {
        var updated = await requisitionLimitRuleService.UpdateAsync(id, updateDto, cancellationToken);
        return Ok(updated);
    }
}