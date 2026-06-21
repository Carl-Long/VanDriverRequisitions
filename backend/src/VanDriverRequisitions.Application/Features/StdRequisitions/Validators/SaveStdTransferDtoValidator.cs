using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdTransferDtoValidator : AbstractValidator<SaveStdTransferDto>
{
    public SaveStdTransferDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty();

        RuleFor(x => x.ShopIdFrom)
            .NotEmpty();

        RuleFor(x => x.ShopIdTo)
            .NotEmpty();

        RuleFor(x => x)
            .Must(x => x.ShopIdFrom != x.ShopIdTo)
            .WithMessage("From shop and to shop must be different.");

        RuleFor(x => x.NumberOfBags)
            .GreaterThanOrEqualTo(0)
            .When(x => x.NumberOfBags.HasValue);

        RuleFor(x => x.NumberOfBoxes)
            .GreaterThanOrEqualTo(0)
            .When(x => x.NumberOfBoxes.HasValue);

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