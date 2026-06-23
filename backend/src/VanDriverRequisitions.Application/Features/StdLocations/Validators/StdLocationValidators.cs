using FluentValidation;
using VanDriverRequisitions.Application.Features.StdLocations.Dtos;

namespace VanDriverRequisitions.Application.Features.StdLocations.Validators;

public sealed class StdLocationAdminQueryDtoValidator : AbstractValidator<StdLocationAdminQueryDto>
{
    public StdLocationAdminQueryDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.Search)
            .MaximumLength(100);

        RuleFor(x => x.ShopId)
            .Must(x => x is null || x.Value != Guid.Empty)
            .WithMessage("Shop is invalid.");

        RuleFor(x => x.CollectionTypeId)
            .Must(x => x is null || x.Value != Guid.Empty)
            .WithMessage("Collection type is invalid.");
    }
}

public sealed class CreateStdLocationDtoValidator : AbstractValidator<CreateStdLocationDto>
{
    public CreateStdLocationDtoValidator()
    {
        RuleFor(x => x.ShopId)
            .NotEmpty()
            .WithMessage("Shop is required.");

        RuleFor(x => x.CollectionTypeId)
            .NotEmpty()
            .WithMessage("Collection type is required.");

        RuleFor(x => x.LocationName)
            .NotEmpty()
            .WithMessage("Location name is required.")
            .MaximumLength(150)
            .WithMessage("Location name must be 150 characters or fewer.");

        RuleFor(x => x.PostCode)
            .NotEmpty()
            .WithMessage("Postcode is required.")
            .MaximumLength(10)
            .WithMessage("Postcode must be 10 characters or fewer.");
    }
}

public sealed class UpdateStdLocationDtoValidator : AbstractValidator<UpdateStdLocationDto>
{
    public UpdateStdLocationDtoValidator()
    {
        RuleFor(x => x.ShopId)
            .NotEmpty()
            .WithMessage("Shop is required.");

        RuleFor(x => x.CollectionTypeId)
            .NotEmpty()
            .WithMessage("Collection type is required.");

        RuleFor(x => x.LocationName)
            .NotEmpty()
            .WithMessage("Location name is required.")
            .MaximumLength(150)
            .WithMessage("Location name must be 150 characters or fewer.");

        RuleFor(x => x.PostCode)
            .NotEmpty()
            .WithMessage("Postcode is required.")
            .MaximumLength(10)
            .WithMessage("Postcode must be 10 characters or fewer.");
    }
}