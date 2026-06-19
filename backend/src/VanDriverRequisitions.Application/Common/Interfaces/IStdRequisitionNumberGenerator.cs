namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IStdRequisitionNumberGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}