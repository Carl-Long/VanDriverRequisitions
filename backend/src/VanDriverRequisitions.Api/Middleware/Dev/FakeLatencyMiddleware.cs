namespace VanDriverRequisitions.Api.Middleware.Dev;

public sealed class FakeLatencyMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        await Task.Delay(Random.Shared.Next(0, 500));

        await _next(context);
    }
}