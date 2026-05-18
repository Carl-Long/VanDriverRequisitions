using FluentValidation;
using FluentValidation.Results;
using Microsoft.Extensions.DependencyInjection;
using VanDriverRequisitions.Application.Common.Interfaces;

namespace VanDriverRequisitions.Application.Common.Validation;

public class ValidatorService(IServiceProvider serviceProvider) : IValidatorService
{
    public async Task ValidateAsync<T>(T model, CancellationToken cancellationToken = default)
    {
        var context = new ValidationContext<T>(model);
        var failures = new List<ValidationFailure>();

        foreach (var validator in serviceProvider.GetServices<IValidator<T>>())
        {
            var result = await validator.ValidateAsync(context, cancellationToken);
            failures.AddRange(result.Errors);
        }

        if (failures.Count != 0)
            throw new ValidationException(failures);
    }
}