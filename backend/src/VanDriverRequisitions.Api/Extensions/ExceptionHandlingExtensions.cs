using VanDriverRequisitions.Api.Middleware;

namespace VanDriverRequisitions.Api.Extensions;

public static class ExceptionHandlingExtensions
{
    public static IServiceCollection AddExceptionHandling(
        this IServiceCollection services)
    {
        services.AddProblemDetails();

        services.AddExceptionHandler<GlobalExceptionHandler>();

        return services;
    }
}