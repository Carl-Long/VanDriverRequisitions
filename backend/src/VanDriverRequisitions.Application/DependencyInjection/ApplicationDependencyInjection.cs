using Microsoft.Extensions.DependencyInjection;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.FeReasons.Services;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Services;
using VanDriverRequisitions.Application.Features.SubmitWindows.Services;

namespace VanDriverRequisitions.Application.DependencyInjection;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IFeTaskTypeService, FeTaskTypeService>();
        services.AddScoped<IFeReasonService, FeReasonService>();
        services.AddScoped<ISubmitWindowService, SubmitWindowService>();
        services.AddScoped<IValidatorService, ValidatorService>();
        return services;
    }
}