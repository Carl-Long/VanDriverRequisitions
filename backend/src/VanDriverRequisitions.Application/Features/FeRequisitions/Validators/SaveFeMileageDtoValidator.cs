using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeMileageDtoValidator : AbstractValidator<SaveFeMileageDto>
{
    public SaveFeMileageDtoValidator()
    {
        RuleFor(x => x.Week)
            .NotNull();

        RuleFor(x => x.RatePerMile)
            .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
            .When(x => x.RatePerMile.HasValue)
            .WithMessage("Rate per mile must be at least £0.01.")
            .Must(x => x is null || MoneyValidationRules.HasMaxTwoDecimalPlaces(x.Value))
            .WithMessage("Rate per mile can have a maximum of 2 decimal places.");
    }
}