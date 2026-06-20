using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdCollectionVanPackDtoValidator
    : AbstractValidator<SaveStdCollectionVanPackDto>
{
    public SaveStdCollectionVanPackDtoValidator()
    {
        RuleFor(x => x.DeliveryDate)
            .NotEmpty();

        RuleFor(x => x.PostCodeZone)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.VanPacksOut)
            .GreaterThan(0);

        RuleFor(x => x.FilledBags)
            .GreaterThan(0)
            .LessThanOrEqualTo(x => x.VanPacksOut)
            .WithMessage("Filled bags cannot be greater than van packs out.");
    }
}