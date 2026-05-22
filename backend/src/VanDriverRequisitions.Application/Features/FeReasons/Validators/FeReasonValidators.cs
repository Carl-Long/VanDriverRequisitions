using System.Text.RegularExpressions;
using FluentValidation;
using VanDriverRequisitions.Application.Features.FeReasons.Dtos;

namespace VanDriverRequisitions.Application.Features.FeReasons.Validators;

public class CreateFeReasonDtoValidator : AbstractValidator<CreateFeReasonDto>
{
    public CreateFeReasonDtoValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .Length(1, 100).WithMessage("Reason must be between 1 and 100 characters.")
            .Matches(@"^[A-Z0-9_-]+$", RegexOptions.IgnoreCase).WithMessage("Reason must contain only letters, numbers, hyphens, and underscores.");
    }
}

public class UpdateFeReasonDtoValidator : AbstractValidator<UpdateFeReasonDto>
{
    public UpdateFeReasonDtoValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .Length(1, 100).WithMessage("Reason must be between 1 and 100 characters.")
            .Matches(@"^[A-Z0-9_-]+$", RegexOptions.IgnoreCase).WithMessage("Reason must contain only letters, numbers, hyphens, and underscores.");
    }
}
