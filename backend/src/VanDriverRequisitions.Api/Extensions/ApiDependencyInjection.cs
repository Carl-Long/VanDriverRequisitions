using System.Security.Claims;
using System.Text;
using Asp.Versioning;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using VanDriverRequisitions.Api.Auth.Dev;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Validators;

namespace VanDriverRequisitions.Api.Extensions;

public static class ApiDependencyInjection
{
    public static IServiceCollection AddApi(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddApiVersioning(options =>
        {
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.ReportApiVersions = true;
        });

        services.AddHttpContextAccessor();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddValidatorsFromAssembly(typeof(CreateFeTaskTypeDtoValidator).Assembly);
        services.AddExceptionHandling();

        services.AddAuthorizationBuilder()
            .AddPolicy(Policies.AdminOnly, p =>
                p.RequireRole(Roles.Admin))
            .AddPolicy(Policies.UserOnly, p =>
                p.RequireRole(Roles.User))
            .AddPolicy(Policies.ApproverOnly, p =>
                p.RequireRole(Roles.Approver));

        return services;
    }
}