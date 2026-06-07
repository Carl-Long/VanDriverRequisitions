using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace VanDriverRequisitions.Api.Auth.Dev;

[ApiController]
[Route("dev/auth")]
public class DevAuthController : ControllerBase
{
    [HttpPost("token")]
    public IActionResult Token(DevLoginRequest request)
    {
        var user = DevUserStore.Get(request.Email);
        if (user is null) return Unauthorized();

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(DevJwtConstants.DevKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("oid", user.Oid.ToString()),
            new("preferred_username", user.UserPrincipalName),
            new("name", user.DisplayName),
        };

        claims.AddRange(user.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: "https://dev.local",
            audience: "api",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return Ok(new { access_token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
}

public record DevLoginRequest(string Email);