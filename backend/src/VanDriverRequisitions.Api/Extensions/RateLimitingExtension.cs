using System.Threading.RateLimiting;
using VanDriverRequisitions.Api.RateLimiting;

namespace VanDriverRequisitions.Api.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddAppRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy(RateLimitPolicies.Read, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetRateLimitPartitionKey(httpContext),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 180,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));

            options.AddPolicy(RateLimitPolicies.Write, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetRateLimitPartitionKey(httpContext),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 40,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));

            options.AddPolicy(RateLimitPolicies.Auth, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    GetRateLimitPartitionKey(httpContext),
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0,
                        AutoReplenishment = true
                    }));
        });

        return services;
    }

    private static string GetRateLimitPartitionKey(HttpContext httpContext)
    {
        return httpContext.User.Identity?.Name
               ?? httpContext.User.FindFirst("preferred_username")?.Value
               ?? httpContext.User.FindFirst("email")?.Value
               ?? httpContext.Connection.RemoteIpAddress?.ToString()
               ?? "anonymous";
    }
}