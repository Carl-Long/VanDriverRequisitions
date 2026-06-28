using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeRequisitionDtoValidator
    : AbstractValidator<SaveFeRequisitionDto>
{
    public SaveFeRequisitionDtoValidator()
    {
        RuleFor(x => x.RequisitionDate)
            .NotEmpty()
            .WithMessage("Requisition date is required.");
        
        RuleFor(x => x.VanDriverId)
            .NotEmpty();

        RuleFor(x => x.ShopId)
            .NotEmpty();

        RuleFor(x => x.VanDriverName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.FeGeneralTasks)
            .NotNull();

        RuleFor(x => x.FeMileages)
            .NotNull();

        RuleFor(x => x.FeTransfers)
            .NotNull();

        RuleFor(x => x.FeAdditionalCosts)
            .NotNull();

        RuleFor(x => x)
            .Must(HaveAtLeastOneRow)
            .WithMessage("At least one requisition row is required.");

        RuleForEach(x => x.FeGeneralTasks).SetValidator(new SaveFeGeneralTaskDtoValidator());
        RuleForEach(x => x.FeMileages).SetValidator(new SaveFeMileageDtoValidator());
        RuleForEach(x => x.FeTransfers).SetValidator(new SaveFeTransferDtoValidator());
        RuleForEach(x => x.FeAdditionalCosts).SetValidator(new SaveFeAdditionalCostDtoValidator());
    }

    private static bool HaveAtLeastOneRow(SaveFeRequisitionDto saveFeRequisitionDto)
    {
        return saveFeRequisitionDto.FeGeneralTasks?.Any() == true
               || saveFeRequisitionDto.FeMileages?.Any() == true
               || saveFeRequisitionDto.FeTransfers?.Any() == true
               || saveFeRequisitionDto.FeAdditionalCosts?.Any() == true;
    }
}