using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeMileageDtoValidator : AbstractValidator<SaveFeMileageDto>
{
    public SaveFeMileageDtoValidator()
    {
        RuleFor(x => x.WeekEndingDate)
            .NotEmpty()
            .WithMessage("Week ending date is required.");
        
        RuleFor(x => x.Week)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .WithMessage("Week quantities are required.")
            .SetValidator(new WeeklyQuantitiesDtoValidator())
            .Must(WeeklyQuantitiesDtoValidator.HasAtLeastOnePositiveQuantity)
            .WithMessage("At least one mileage quantity is required.");

        RuleFor(x => x.RatePerMile)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .WithMessage("Rate per mile is required.")
            .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
            .WithMessage("Rate per mile must be at least £0.01.")
            .Must(x => x is null || MoneyValidationRules.HasMaxTwoDecimalPlaces(x.Value))
            .WithMessage("Rate per mile can have a maximum of 2 decimal places.");
    }
}