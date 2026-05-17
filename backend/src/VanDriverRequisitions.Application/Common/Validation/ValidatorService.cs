using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using VanDriverRequisitions.Application.Common.Interfaces;

namespace VanDriverRequisitions.Application.Common.Validation;

public class ValidatorService(IServiceProvider serviceProvider) : IValidatorService
{
    public async Task ValidateAsync<T>(T model, CancellationToken cancellationToken = default)
    {
        var validators = serviceProvider.GetServices<IValidator<T>>();

        if (!validators.Any())
            return;

        var context = new ValidationContext<T>(model);

        var failures = new List<FluentValidation.Results.ValidationFailure>();

        foreach (var validator in validators)
        {
            var result = await validator.ValidateAsync(context, cancellationToken);
            failures.AddRange(result.Errors);
        }

        if (failures.Any())
            throw new ValidationException(failures);
    }
}