using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

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

        this.ApplyStdChargeRules();
    }
}