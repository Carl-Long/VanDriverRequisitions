using VanDriverRequisitions.Api.Extensions;
using VanDriverRequisitions.Api.Middleware.Dev;
using VanDriverRequisitions.Application.DependencyInjection;
using VanDriverRequisitions.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "Frontend";

builder.Services.AddApi();
builder.Services.AddAppAuthentication(builder.Configuration, builder.Environment);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAppRateLimiting();

builder.Services.Configure<FakeLatencyOptions>(builder.Configuration.GetSection("Dev:FakeLatency"));

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

if (allowedOrigins.Length == 0 && builder.Environment.IsDevelopment())
{
    allowedOrigins = ["http://localhost:3000"];
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();

app.UseMiddleware<FakeLatencyMiddleware>();

app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/health", () => Results.Ok("OK")).AllowAnonymous();

app.MapControllers();

await app.ApplyDatabaseStartupTasksAsync();

await app.RunAsync();