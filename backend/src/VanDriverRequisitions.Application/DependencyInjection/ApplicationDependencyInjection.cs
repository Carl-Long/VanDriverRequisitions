using Microsoft.Extensions.DependencyInjection;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.CostReasons.Services;
using VanDriverRequisitions.Application.Features.FeRequisitions.Builders;
using VanDriverRequisitions.Application.Features.FeRequisitions.Services;
using VanDriverRequisitions.Application.Features.FeRequisitions.Validators;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Services;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;
using VanDriverRequisitions.Application.Features.Shops.Services;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Services;
using VanDriverRequisitions.Application.Features.StdLocations.Services;
using VanDriverRequisitions.Application.Features.StdRequisitions.Builders;
using VanDriverRequisitions.Application.Features.StdRequisitions.Services;
using VanDriverRequisitions.Application.Features.StdRequisitions.Validators;
using VanDriverRequisitions.Application.Features.SubmitWindows.Services;
using VanDriverRequisitions.Application.Features.Users.Services;
using VanDriverRequisitions.Application.Features.VanDrivers.Services;

namespace VanDriverRequisitions.Application.DependencyInjection;

public static class ApplicationDependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton(TimeProvider.System);
        
        services.AddScoped<IFeRequisitionService, FeRequisitionService>();
        services.AddScoped<IFeTaskTypeService, FeTaskTypeService>();
        services.AddScoped<ICostReasonService, CostReasonService>();
        services.AddScoped<IRequisitionUserService, RequisitionUserService>();
        services.AddScoped<IFeRequisitionSaveDataBuilder, FeRequisitionSaveDataBuilder>();
        services.AddScoped<IFeRequisitionLimitValidator, FeRequisitionLimitValidator>();
        
        services.AddScoped<IStdRequisitionService, StdRequisitionService>();
        services.AddScoped<IStdRequisitionSaveDataBuilder, StdRequisitionSaveDataBuilder>();
        services.AddScoped<IStdCollectionTypeService, StdCollectionTypeService>();
        services.AddScoped<IStdLocationService, StdLocationService>();
        services.AddScoped<IStdRequisitionLimitValidator, StdRequisitionLimitValidator>();
        
        services.AddScoped<ISubmitWindowService, SubmitWindowService>();
        services.AddScoped<IRequisitionLimitRuleService, RequisitionLimitRuleService>();
        services.AddScoped<IShopService, ShopService>();
        services.AddScoped<IVanDriverService, VanDriverService>();
        services.AddScoped<IValidatorService, ValidatorService>();
        
        return services;
    }
}