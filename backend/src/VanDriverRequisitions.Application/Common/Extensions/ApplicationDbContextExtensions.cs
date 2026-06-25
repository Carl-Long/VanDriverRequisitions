using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;

namespace VanDriverRequisitions.Application.Common.Extensions;

public static class ApplicationDbContextExtensions
{
    private const string DefaultConcurrencyMessage =
        "This requisition has been updated by another user since you opened it. " +
        "Refresh the page to load the latest version. " +
        "Any changes you have made since opening the requisition will need to be re-entered.";

    public static async Task SaveChangesWithConcurrencyHandlingAsync(this IApplicationDbContext context, CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException(DefaultConcurrencyMessage);
        }
    }
}