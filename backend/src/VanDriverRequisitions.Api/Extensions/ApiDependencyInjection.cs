using System.Text.Json.Serialization;
using Asp.Versioning;
using FluentValidation;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Validators;

namespace VanDriverRequisitions.Api.Extensions;

public static class ApiDependencyInjection
{
    public static IServiceCollection AddApi(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
        
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
            .AddPolicy(Policies.CanCreateRequisitions, p =>
                p.RequireRole(Roles.User, Roles.Admin))
            .AddPolicy(Policies.CanApproveRequisitions, p =>
                p.RequireRole(Roles.Approver))
            .AddPolicy(Policies.CanManageConfiguration, p =>
                p.RequireRole(Roles.Admin));

        return services;
    }
}