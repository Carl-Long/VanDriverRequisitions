namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IFeRequisitionNumberGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}