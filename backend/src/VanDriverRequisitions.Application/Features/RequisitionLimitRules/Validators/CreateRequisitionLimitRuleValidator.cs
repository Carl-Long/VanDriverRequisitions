using FluentValidation;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Validators;

public class CreateRequisitionLimitRuleDtoValidator
    : AbstractValidator<CreateRequisitionLimitRuleDto>
{
    public CreateRequisitionLimitRuleDtoValidator()
    {
        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("Category is required and must be valid.");

        RuleFor(x => x.FeTaskTypeId)
            .NotEmpty()
            .WithMessage("FeTaskTypeId is required.");

        RuleFor(x => x.Fascia)
            .IsInEnum()
            .WithMessage("Fascia is required and must be valid.");

        RuleFor(x => x.MaxQuantity)
            .GreaterThan(0)
            .WithMessage("MaxQuantity must be greater than 0.");

        RuleFor(x => x.MaxRate)
            .GreaterThan(0)
            .WithMessage("MaxRate must be greater than 0.");
    }
}