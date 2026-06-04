using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VanDriverRequisitions.Application.Features.Users.Dtos;
using VanDriverRequisitions.Application.Features.Users.Services;

namespace VanDriverRequisitions.Api.Controllers.Common;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/requisition-users")]
[Authorize]
public class RequisitionUsersController(IFeRequisitionUserService requisitionUserService ) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Search([FromQuery] RequisitionUserSearchQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await requisitionUserService.SearchAsync(query, cancellationToken);
        return Ok(result);
    }
}