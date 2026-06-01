namespace VanDriverRequisitions.Api.Middleware;

public sealed class FakeLatencyMiddleware(RequestDelegate next)
{
    private readonly RequestDelegate _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        await Task.Delay(Random.Shared.Next(500, 1500));

        await _next(context);
    }
}