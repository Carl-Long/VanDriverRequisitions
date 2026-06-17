using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Infrastructure.Persistence.EntityFramework;

namespace VanDriverRequisitions.Infrastructure.Services;

public class SqlFeRequisitionNumberGenerator(VanDriverDbContext dbContext) : IRequisitionNumberGenerator
{
    public Task<string> GenerateAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.NextFeRequisitionNumberAsync(cancellationToken);
    }
}