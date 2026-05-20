using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using VanDriverRequisitions.Api.Auth.Dev;

namespace VanDriverRequisitions.Api.Extensions;

public static class AuthenticationInjections
{
    public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration config, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            AddDevAuth(services);
        }
        else
        {
            AddEntraAuth(services, config);
        }
        return services;
    }

    private static void AddDevAuth(IServiceCollection services)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = "https://dev.local",
                    ValidAudience = "api",
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(DevJwtConstants.DevKey)),
                    RoleClaimType = ClaimTypes.Role
                };
            });
    }

    private static void AddEntraAuth(IServiceCollection services, IConfiguration config)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddMicrosoftIdentityWebApi(
                config.GetSection("AzureAd"));
    }
}