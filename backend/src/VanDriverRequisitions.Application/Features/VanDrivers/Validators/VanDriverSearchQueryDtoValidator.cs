using FluentValidation;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

namespace VanDriverRequisitions.Application.Features.VanDrivers.Validators;

public class VanDriverSearchQueryDtoValidator : AbstractValidator<VanDriverSearchQueryDto>
{
    public VanDriverSearchQueryDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.Search)
            .MaximumLength(100)
            .WithMessage("Search cannot exceed 100 characters.");
    }
}