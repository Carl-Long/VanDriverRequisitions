namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IPoNumberGenerator
{
    Task<string> GenerateAsync(CancellationToken cancellationToken = default);
}