using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Domain.Entities.Base;

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
    
    public static void SetOriginalRowVersion<TEntity>(this IApplicationDbContext context, TEntity entity, byte[]? rowVersion) where TEntity : ConcurrencyAwareEntity
    {
        if (rowVersion is null)
        {
            return;
        }

        context.Entry(entity).Property(nameof(ConcurrencyAwareEntity.RowVersion)).OriginalValue = rowVersion;
    }
    
    public static async Task SaveChangesWithUniqueConstraintValidationAsync(this IApplicationDbContext context, string propertyName, string message, CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueConstraintViolation(ex))
        {
            throw new ValidationException([new ValidationFailure(propertyName, message)]);
        }
    }
}