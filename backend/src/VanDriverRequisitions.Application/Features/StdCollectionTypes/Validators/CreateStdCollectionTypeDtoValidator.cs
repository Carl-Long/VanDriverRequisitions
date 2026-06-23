using FluentValidation;
using VanDriverRequisitions.Application.Features.StdCollectionTypes.Dtos;

namespace VanDriverRequisitions.Application.Features.StdCollectionTypes.Validators;

public sealed class CreateStdCollectionTypeDtoValidator : AbstractValidator<CreateStdCollectionTypeDto>
{
    public CreateStdCollectionTypeDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Length(1, 20).WithMessage("Code must be between 1 and 20 characters.")
            .Matches(@"^\d+$").WithMessage("Code must contain numbers only.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .Length(1, 100).WithMessage("Name must be between 1 and 100 characters.");
    }
}

public sealed class UpdateStdCollectionTypeDtoValidator : AbstractValidator<UpdateStdCollectionTypeDto>
{
    public UpdateStdCollectionTypeDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Length(1, 20).WithMessage("Code must be between 1 and 20 characters.")
            .Matches(@"^\d+$").WithMessage("Code must contain numbers only.");
        
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .Length(1, 100).WithMessage("Name must be between 1 and 100 characters.");
    }
}