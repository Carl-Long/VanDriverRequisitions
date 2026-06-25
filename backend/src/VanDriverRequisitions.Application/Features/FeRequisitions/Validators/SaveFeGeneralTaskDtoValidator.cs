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