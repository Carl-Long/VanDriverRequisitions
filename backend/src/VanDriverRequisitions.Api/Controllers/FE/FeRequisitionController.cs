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
}