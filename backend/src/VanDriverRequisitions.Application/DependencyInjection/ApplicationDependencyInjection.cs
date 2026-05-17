using Microsoft.Extensions.DependencyInjection;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Services;

namespace VanDriverRequisitions.Application.DependencyInjection;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IFeTaskTypeService, FeTaskTypeService>();
        services.AddScoped<IValidatorService, ValidatorService>();
        return services;
    }
}