using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

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

        this.ApplyStdChargeRules();
    }
}