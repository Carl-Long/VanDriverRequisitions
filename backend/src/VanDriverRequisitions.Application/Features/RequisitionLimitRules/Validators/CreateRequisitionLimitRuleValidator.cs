using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Enums;

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
            .WithMessage("Max quantity must be greater than zero.");

        RuleFor(x => x.MaxRate)
            .GreaterThanOrEqualTo(MoneyValidationRules.MinimumMoneyAmount)
            .WithMessage("Max rate must be at least £0.01.")
            .Must(MoneyValidationRules.HasMaxTwoDecimalPlaces)
            .WithMessage("Max rate can have a maximum of 2 decimal places.");
    }
}