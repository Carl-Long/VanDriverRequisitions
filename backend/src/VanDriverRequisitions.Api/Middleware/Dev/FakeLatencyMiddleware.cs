using Microsoft.Extensions.Options;

namespace VanDriverRequisitions.Api.Middleware.Dev;

public sealed class FakeLatencyMiddleware(RequestDelegate next, IOptions<FakeLatencyOptions> options)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var settings = options.Value;

        var min = Math.Max(0, settings.MinMilliseconds);
        var max = Math.Max(min, settings.MaxMilliseconds);

        if (settings.Enabled && max > 0)
        {
            await Task.Delay(Random.Shared.Next(min, max + 1));
        }

        await next(context);
    }
}