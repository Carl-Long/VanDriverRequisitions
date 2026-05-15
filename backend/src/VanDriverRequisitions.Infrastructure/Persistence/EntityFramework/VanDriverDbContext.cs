using Microsoft.EntityFrameworkCore;

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

public class VanDriverDbContext(DbContextOptions<VanDriverDbContext> options)
    : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VanDriverDbContext).Assembly);
    }
}