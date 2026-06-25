using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class WeeklyQuantitiesDtoValidator : AbstractValidator<WeeklyQuantitiesDto>
{
    public WeeklyQuantitiesDtoValidator()
    {
        RuleFor(x => x.Sunday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Sunday.HasValue)
            .WithMessage("Sunday cannot be negative.");

        RuleFor(x => x.Monday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Monday.HasValue)
            .WithMessage("Monday cannot be negative.");

        RuleFor(x => x.Tuesday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Tuesday.HasValue)
            .WithMessage("Tuesday cannot be negative.");

        RuleFor(x => x.Wednesday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Wednesday.HasValue)
            .WithMessage("Wednesday cannot be negative.");

        RuleFor(x => x.Thursday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Thursday.HasValue)
            .WithMessage("Thursday cannot be negative.");

        RuleFor(x => x.Friday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Friday.HasValue)
            .WithMessage("Friday cannot be negative.");

        RuleFor(x => x.Saturday)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Saturday.HasValue)
            .WithMessage("Saturday cannot be negative.");
    }
}