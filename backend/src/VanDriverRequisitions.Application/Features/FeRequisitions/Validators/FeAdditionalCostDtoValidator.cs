using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeAdditionalCostDtoValidator
    : AbstractValidator<SaveFeAdditionalCostDto>
{
    public SaveFeAdditionalCostDtoValidator()
    {
        RuleFor(x => x.WeekEndingDate)
            .NotEmpty();

        RuleFor(x => x.ReasonId)
            .NotEmpty()
            .WithMessage("Reason is required.");

        RuleFor(x => x.ChargingOption)
            .IsInEnum();

        When(x => x.ChargingOption == ChargingOption.Job, () =>
        {
            RuleFor(x => x.TotalNumber)
                .NotNull()
                .WithMessage("Total number is required.")
                .GreaterThan(0)
                .WithMessage("Total number must be greater than zero.");

            RuleFor(x => x.RatePerJob)
                .NotNull()
                .WithMessage("Rate per job is required.")
                .GreaterThanOrEqualTo(0)
                .WithMessage("Rate per job cannot be negative.");

            RuleFor(x => x.Miles)
                .Null()
                .WithMessage("Miles must be empty for job-based additional costs.");

            RuleFor(x => x.RatePerMile)
                .Null()
                .WithMessage("Rate per mile must be empty for job-based additional costs.");
        });

        When(x => x.ChargingOption == ChargingOption.Mileage, () =>
        {
            RuleFor(x => x.Miles)
                .NotNull()
                .WithMessage("Miles are required.")
                .GreaterThan(0)
                .WithMessage("Miles must be greater than zero.");

            RuleFor(x => x.RatePerMile)
                .NotNull()
                .WithMessage("Rate per mile is required.")
                .GreaterThanOrEqualTo(0)
                .WithMessage("Rate per mile cannot be negative.");

            RuleFor(x => x.TotalNumber)
                .Null()
                .WithMessage("Total number must be empty for mileage-based additional costs.");

            RuleFor(x => x.RatePerJob)
                .Null()
                .WithMessage("Rate per job must be empty for mileage-based additional costs.");
        });
    }
}