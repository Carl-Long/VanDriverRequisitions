using FluentValidation;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Validators;

public class CreateRequisitionLimitRuleDtoValidator : AbstractValidator<CreateRequisitionLimitRuleDto>
{
    public CreateRequisitionLimitRuleDtoValidator()
    {
        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("Category is required and must be valid.");

        // FeTaskTypeId is required ONLY when GeneralTask
        RuleFor(x => x.FeTaskTypeId)
            .Must((dto, id) =>
                dto.Category != RequisitionRowCategory.GeneralTask || id != null)
            .WithMessage("FeTaskTypeId is required when Category is GeneralTask.");

        // FeTaskTypeId must be null when NOT GeneralTask
        RuleFor(x => x.FeTaskTypeId)
            .Must((dto, id) =>
                dto.Category == RequisitionRowCategory.GeneralTask || id == null)
            .WithMessage("FeTaskTypeId must be null unless Category is GeneralTask.");

        RuleFor(x => x.Fascia)
            .IsInEnum()
            .When(x => x.Fascia.HasValue)
            .WithMessage("Fascia must be valid if provided.");

        RuleFor(x => x.MaxQuantity)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MaxQuantity.HasValue)
            .WithMessage("MaxQuantity must be greater than or equal to 0.");

        RuleFor(x => x.MaxRate)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MaxRate.HasValue)
            .WithMessage("MaxRate must be greater than or equal to 0.");
    }
}