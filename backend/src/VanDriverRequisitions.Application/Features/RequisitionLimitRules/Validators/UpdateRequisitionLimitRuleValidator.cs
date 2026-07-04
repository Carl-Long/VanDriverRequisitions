using FluentValidation;
using VanDriverRequisitions.Application.Common.Validation;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Validators;

public class UpdateRequisitionLimitRuleDtoValidator : AbstractValidator<UpdateRequisitionLimitRuleDto>
{
    public UpdateRequisitionLimitRuleDtoValidator()
    {
        RuleFor(x => x.Category)
            .IsInEnum()
            .WithMessage("Category is required and must be valid.");

        RuleFor(x => x.Fascia)
            .IsInEnum()
            .WithMessage("Fascia is required and must be valid.");

        RuleFor(x => x.Category)
            .Must((dto, category) =>
                RequisitionLimitRuleCategoryCompatibility.IsAllowed(dto.Fascia, category))
            .WithMessage("Category is not supported for the selected fascia.");

        RuleFor(x => x.FeTaskTypeId)
            .Must((dto, id) =>
            {
                var isFeGeneralTask =
                    dto.Fascia == Fascia.Fe &&
                    dto.Category == RequisitionRowCategory.GeneralTask;

                return isFeGeneralTask
                    ? id is not null
                    : id is null;
            })
            .WithMessage("FeTaskTypeId is required only for FE GeneralTask and must be null for other categories.");

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