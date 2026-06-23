using FluentValidation;
using VanDriverRequisitions.Application.Features.CostReasons.Dtos;

namespace VanDriverRequisitions.Application.Features.CostReasons.Validators;

public class CreateCostReasonDtoValidator : AbstractValidator<CreateCostReasonDto>
{
    public CreateCostReasonDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Length(1, 20).WithMessage("Code must be between 1 and 20 characters.")
            .Matches("^[0-9]+$").WithMessage("Code must contain numbers only.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .Length(1, 100).WithMessage("Reason must be between 1 and 100 characters.");

        RuleFor(x => x.Scope)
            .IsInEnum()
            .WithMessage("Scope is required and must be valid.");
    }
}

public class UpdateCostReasonDtoValidator : AbstractValidator<UpdateCostReasonDto>
{
    public UpdateCostReasonDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .Length(1, 20).WithMessage("Code must be between 1 and 20 characters.")
            .Matches("^[0-9]+$").WithMessage("Code must contain numbers only.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .Length(1, 100).WithMessage("Reason must be between 1 and 100 characters.");

        RuleFor(x => x.Scope)
            .IsInEnum()
            .WithMessage("Scope is required and must be valid.");
    }
}