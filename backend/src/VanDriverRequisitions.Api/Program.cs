using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Security;
using VanDriverRequisitions.Infrastructure.Identity;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Interceptors;

var builder = WebApplication.CreateBuilder(args);

//builder.Services
//    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddControllers();
builder.Services.AddAuthorization(options =>
 {
     options.AddPolicy(Roles.Admin, p => p.RequireRole(Roles.Admin));
     options.AddPolicy(Roles.User, p => p.RequireRole(Roles.User));
 });

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<AuditableEntityInterceptor>();

builder.Services.AddDbContext<VanDriverDbContext>((sp, options) =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
    
    options.AddInterceptors(
        sp.GetRequiredService<AuditableEntityInterceptor>());
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();