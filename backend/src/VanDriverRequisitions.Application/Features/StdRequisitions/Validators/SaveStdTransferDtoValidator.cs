using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

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

        this.ApplyStdChargeRules();
    }
}