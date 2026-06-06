using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Infrastructure.Identity;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Interceptors;
using VanDriverRequisitions.Infrastructure.Services;

namespace VanDriverRequisitions.Infrastructure.DependencyInjection;

public static class InfrastructureDependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddScoped<AuditableEntityInterceptor>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IPoNumberGenerator, SqlPoNumberGenerator>();

        services.AddDbContext<VanDriverDbContext>((sp, options) =>
        {
            options.UseSqlServer(
                config.GetConnectionString("DefaultConnection"));

            options.AddInterceptors(
                sp.GetRequiredService<AuditableEntityInterceptor>());
        });

        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<VanDriverDbContext>());

        return services;
    }
}