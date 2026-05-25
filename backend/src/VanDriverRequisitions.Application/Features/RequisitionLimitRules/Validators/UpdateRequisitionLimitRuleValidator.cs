using FluentValidation;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Validators;

public class UpdateRequisitionLimitRuleDtoValidator
    : AbstractValidator<UpdateRequisitionLimitRuleDto>
{
    public UpdateRequisitionLimitRuleDtoValidator()
    {
        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("Category is required and must be valid.");

        RuleFor(x => x.FeTaskTypeId)
            .Must((dto, id) =>
                dto.Category == RequisitionRowCategory.GeneralTask
                    ? id != null
                    : id == null)
            .WithMessage("FeTaskTypeId is required only for GeneralTask and must be null for other categories.");

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