namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface IValidatorService
{
    Task ValidateAsync<T>(T model, CancellationToken cancellationToken = default);
}