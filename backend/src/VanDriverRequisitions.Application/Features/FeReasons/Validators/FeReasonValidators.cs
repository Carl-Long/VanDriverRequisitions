using FluentValidation;
using VanDriverRequisitions.Application.Features.FeReasons.Dtos;

namespace VanDriverRequisitions.Application.Features.FeReasons.Validators;

public class CreateFeReasonDtoValidator : AbstractValidator<CreateFeReasonDto>
{
    public CreateFeReasonDtoValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .Length(1, 200).WithMessage("Reason must be between 1 and 200 characters.");
    }
}

public class UpdateFeReasonDtoValidator : AbstractValidator<UpdateFeReasonDto>
{
    public UpdateFeReasonDtoValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .Length(1, 200).WithMessage("Reason must be between 1 and 200 characters.");
    }
}
