using FluentValidation;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;

namespace VanDriverRequisitions.Application.Features.StdLocations.Validators;

public sealed class StdLocationLookupQueryDtoValidator : AbstractValidator<StdLocationLookupQueryDto>
{
    public StdLocationLookupQueryDtoValidator()
    {
        RuleFor(x => x.ShopId)
            .NotEmpty()
            .WithMessage("Shop is required.");

        RuleFor(x => x.CollectionTypeId)
            .NotEmpty()
            .WithMessage("Collection type is required.");
    }
}