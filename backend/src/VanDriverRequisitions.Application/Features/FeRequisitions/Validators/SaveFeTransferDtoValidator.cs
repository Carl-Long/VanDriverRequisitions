using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeTransferDtoValidator : AbstractValidator<SaveFeTransferDto>
{
    public SaveFeTransferDtoValidator()
    {
        RuleFor(x => x.ShopIdFrom)
            .NotEmpty()
            .WithMessage("From shop is required.");

        RuleFor(x => x.ShopIdTo)
            .NotEmpty()
            .WithMessage("To shop is required.");

        RuleFor(x => x)
            .Must(x => x.ShopIdFrom != x.ShopIdTo)
            .WithMessage("From shop and to shop must be different.");

        RuleFor(x => x.Week)
            .NotNull()
            .SetValidator(new WeeklyQuantitiesDtoValidator());

        RuleFor(x => x.RatePerJob)
            .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
            .When(x => x.RatePerJob.HasValue)
            .WithMessage("Rate per job must be at least £0.01.")
            .Must(x => x is null || MoneyValidationRules.HasMaxTwoDecimalPlaces(x.Value))
            .WithMessage("Rate per job can have a maximum of 2 decimal places.");
    }
}