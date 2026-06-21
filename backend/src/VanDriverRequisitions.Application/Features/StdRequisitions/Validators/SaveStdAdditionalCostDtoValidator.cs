using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdAdditionalCostDtoValidator : AbstractValidator<SaveStdAdditionalCostDto>
{
    public SaveStdAdditionalCostDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty();

        RuleFor(x => x.ReasonId)
            .NotEmpty()
            .WithMessage("Reason is required.");

        RuleFor(x => x.NumberOfBags)
            .GreaterThan(0)
            .WithMessage("Number of bags must be greater than zero.");

        RuleFor(x => x.ChargeType)
            .IsInEnum();

        When(x => x.ChargeType == StdChargeType.Mileage, () =>
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

            RuleFor(x => x.FlatCharge)
                .Null()
                .WithMessage("Flat charge must be empty for mileage charges.");
        });

        When(x => x.ChargeType == StdChargeType.FlatCharge, () =>
        {
            RuleFor(x => x.FlatCharge)
                .NotNull()
                .WithMessage("Flat charge is required.")
                .GreaterThanOrEqualTo(0)
                .WithMessage("Flat charge cannot be negative.");

            RuleFor(x => x.Miles)
                .Null()
                .WithMessage("Miles must be empty for flat charges.");

            RuleFor(x => x.RatePerMile)
                .Null()
                .WithMessage("Rate per mile must be empty for flat charges.");
        });
    }
}