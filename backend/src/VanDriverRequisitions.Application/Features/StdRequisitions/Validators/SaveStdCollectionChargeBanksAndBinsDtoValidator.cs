using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdCollectionChargeBanksAndBinsDtoValidator
    : AbstractValidator<SaveStdCollectionChargeBanksAndBinsDto>
{
    public SaveStdCollectionChargeBanksAndBinsDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("Date is required.");

        RuleFor(x => x.CollectionTypeId)
            .NotEmpty()
            .WithMessage("Collection type is required.");

        RuleFor(x => x.LocationId)
            .NotEmpty()
            .WithMessage("Location is required.");

        RuleFor(x => x.NumberOfBags)
            .GreaterThanOrEqualTo(0)
            .When(x => x.NumberOfBags.HasValue)
            .WithMessage("Number of bags cannot be negative.");

        RuleFor(x => x.ChargeType)
            .IsInEnum()
            .WithMessage("Invalid charge type.");

        When(x => x.ChargeType == StdChargeType.Mileage, () =>
        {
            RuleFor(x => x.Miles)
                .NotNull()
                .WithMessage("Miles are required for mileage charges.")
                .GreaterThan(0)
                .WithMessage("Miles must be greater than zero.");

            RuleFor(x => x.RatePerMile)
                .NotNull()
                .WithMessage("Rate per mile is required for mileage charges.")
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