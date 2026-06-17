namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IRequisitionNumberGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}