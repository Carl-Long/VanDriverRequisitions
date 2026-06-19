using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

namespace VanDriverRequisitions.Infrastructure.Services;

public sealed class SqlStdRequisitionNumberGenerator(VanDriverDbContext dbContext) : IStdRequisitionNumberGenerator
{
    public Task<string> GenerateAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.NextStdRequisitionNumberAsync(cancellationToken);
    }
}