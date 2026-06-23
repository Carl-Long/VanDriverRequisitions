using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdAdditionalCostDtoValidator : AbstractValidator<SaveStdAdditionalCostDto>
{
    public SaveStdAdditionalCostDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty();

        RuleFor(x => x.ReasonId)
            .NotEmpty()
            .WithMessage("Reason is required.");

        RuleFor(x => x.NumberOfBags)
            .GreaterThan(0)
            .WithMessage("Number of bags must be greater than zero.");

        this.ApplyStdChargeRules();
    }
}