using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdPickupDtoValidator : AbstractValidator<SaveStdPickupDto>
{
    public SaveStdPickupDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty();

        RuleFor(x => x.NumberOfBags)
            .GreaterThan(0);

        RuleFor(x => x.NumberOfHouseholds)
            .GreaterThan(0);

        RuleFor(x => x.ChargeType)
            .IsInEnum();

        When(x => x.ChargeType == StdChargeType.Mileage, () =>
        {
            RuleFor(x => x.Miles)
                .NotNull()
                .GreaterThan(0);

            RuleFor(x => x.RatePerMile)
                .NotNull()
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x.FlatCharge)
                .Null()
                .WithMessage("Flat charge must be empty for mileage charges.");
        });

        When(x => x.ChargeType == StdChargeType.FlatCharge, () =>
        {
            RuleFor(x => x.FlatCharge)
                .NotNull()
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x.Miles)
                .Null()
                .WithMessage("Miles must be empty for flat charges.");

            RuleFor(x => x.RatePerMile)
                .Null()
                .WithMessage("Rate per mile must be empty for flat charges.");
        });
    }
}