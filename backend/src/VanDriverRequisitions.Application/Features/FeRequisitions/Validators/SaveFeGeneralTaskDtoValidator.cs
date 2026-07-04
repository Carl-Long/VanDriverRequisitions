using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeGeneralTaskDtoValidator : AbstractValidator<SaveFeGeneralTaskDto>
{
    public SaveFeGeneralTaskDtoValidator()
    {
        RuleFor(x => x.FeTaskTypeId)
            .NotEmpty();

        RuleFor(x => x.WeekEndingDate)
            .NotEmpty();
        
        RuleFor(x => x.Week)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .WithMessage("Week quantities are required.")
            .SetValidator(new WeeklyQuantitiesDtoValidator())
            .Must(WeeklyQuantitiesDtoValidator.HasAtLeastOnePositiveQuantity)
            .WithMessage("At least one job quantity is required.");

        RuleFor(x => x.RatePerJob)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .WithMessage("Rate per job is required.")
            .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
            .WithMessage("Rate per job must be at least £0.01.")
            .Must(x => x is null || MoneyValidationRules.HasMaxTwoDecimalPlaces(x.Value))
            .WithMessage("Rate per job can have a maximum of 2 decimal places.");
    }
}