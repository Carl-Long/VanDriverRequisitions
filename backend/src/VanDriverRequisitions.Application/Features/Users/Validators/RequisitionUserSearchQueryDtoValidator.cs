using FluentValidation;
using VanDriverRequisitions.Application.Features.Users.Dtos;

namespace VanDriverRequisitions.Application.Features.Users.Validators;

public class RequisitionUserSearchQueryDtoValidator 
    : AbstractValidator<RequisitionUserSearchQueryDto>
{
    public RequisitionUserSearchQueryDtoValidator()
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