using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public static class StdChargeValidationRules
{
    public static void ApplyStdChargeRules<T>(this AbstractValidator<T> validator) where T : IStdChargeDto
    {
        validator.RuleFor(x => x.ChargeType)
            .IsInEnum()
            .WithMessage("Invalid charge type.");

        validator.When(x => x.ChargeType == StdChargeType.Mileage, () =>
        {
            validator.RuleFor(x => x.Miles)
                .NotNull()
                .WithMessage("Miles are required for mileage charges.")
                .GreaterThan(0)
                .WithMessage("Miles must be greater than zero.");

            validator.RuleFor(x => x.RatePerMile)
                .NotNull()
                .WithMessage("Rate per mile is required for mileage charges.")
                .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
                .WithMessage("Rate per mile must be at least £0.01.")
                .Must(x => x is null || MoneyValidationRules.HasMaxTwoDecimalPlaces(x.Value))
                .WithMessage("Rate per mile can have a maximum of 2 decimal places.");

            validator.RuleFor(x => x.FlatCharge)
                .Null()
                .WithMessage("Flat charge must be empty for mileage charges.");
        });

        validator.When(x => x.ChargeType == StdChargeType.FlatCharge, () =>
        {
            validator.RuleFor(x => x.FlatCharge)
            .NotNull()
            .WithMessage("Flat charge is required.")
            .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
            .WithMessage("Flat charge must be at least £0.01.")
            .Must(x => x is null || MoneyValidationRules.HasMaxTwoDecimalPlaces(x.Value))
            .WithMessage("Flat charge can have a maximum of 2 decimal places.");

            validator.RuleFor(x => x.Miles)
                .Null()
                .WithMessage("Miles must be empty for flat charges.");

            validator.RuleFor(x => x.RatePerMile)
                .Null()
                .WithMessage("Rate per mile must be empty for flat charges.");
        });
    }
}