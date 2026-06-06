using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

namespace VanDriverRequisitions.Infrastructure.Services;

public sealed class SqlPoNumberGenerator(VanDriverDbContext dbContext) : IPoNumberGenerator
{
    public Task<string> GenerateAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.NextPoNumberAsync(cancellationToken);
    }
}