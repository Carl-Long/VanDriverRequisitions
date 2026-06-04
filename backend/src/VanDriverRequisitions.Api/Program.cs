using VanDriverRequisitions.Api.Extensions;
using VanDriverRequisitions.Api.Middleware;
using VanDriverRequisitions.Api.Middleware.Dev;
using VanDriverRequisitions.Application.DependencyInjection;
using VanDriverRequisitions.Infrastructure.DependencyInjection;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApi();
builder.Services.AddAppAuthentication(builder.Configuration, builder.Environment);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.UseMiddleware<FakeLatencyMiddleware>();
    app.UseCors();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<VanDriverDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DevDataSeeder.SeedAsync(db, logger);
}

await app.RunAsync();