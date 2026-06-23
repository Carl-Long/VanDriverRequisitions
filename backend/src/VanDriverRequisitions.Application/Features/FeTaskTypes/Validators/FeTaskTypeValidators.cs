using FluentValidation;
using VanDriverRequisitions.Application.Features.FeTaskTypes.Dtos;

namespace VanDriverRequisitions.Application.Features.FeTaskTypes.Validators;

public class CreateFeTaskTypeDtoValidator : AbstractValidator<CreateFeTaskTypeDto>
{
    public CreateFeTaskTypeDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .Length(1, 100).WithMessage("Name must be between 1 and 100 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Length(1, 20).WithMessage("Code must be between 1 and 20 characters.")
            .Matches(@"^\d+$").WithMessage("Code must contain numbers only.");
    }
}

public class UpdateFeTaskTypeDtoValidator : AbstractValidator<UpdateFeTaskTypeDto>
{
    public UpdateFeTaskTypeDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .Length(1, 100).WithMessage("Name must be between 1 and 100 characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Length(1, 20).WithMessage("Code must be between 1 and 20 characters.")
            .Matches(@"^\d+$").WithMessage("Code must contain numbers only.");
    }
}
