using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.SubmitWindows.Extensions;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Services;

public sealed class SubmitWindowSubmissionGuard(IApplicationDbContext context, TimeProvider timeProvider) : ISubmitWindowSubmissionGuard
{
    public async Task EnsureSubmissionWindowIsOpenAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcDateTime();

        var isOpen = await context.SubmitWindows.OpenAt(now).AnyAsync(cancellationToken);

        if (!isOpen)
        {
            throw new BadRequestException("Requisitions can only be submitted while a submission window is open.");
        }
    }
}