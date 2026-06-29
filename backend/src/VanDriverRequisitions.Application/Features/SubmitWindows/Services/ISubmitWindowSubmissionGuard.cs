namespace VanDriverRequisitions.Application.Features.SubmitWindows.Services;

public interface ISubmitWindowSubmissionGuard
{
    Task EnsureSubmissionWindowIsOpenAsync(CancellationToken cancellationToken = default);
}