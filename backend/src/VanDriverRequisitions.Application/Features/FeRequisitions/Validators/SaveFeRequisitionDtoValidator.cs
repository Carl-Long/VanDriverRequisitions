using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeRequisitionDtoValidator
    : AbstractValidator<SaveFeRequisitionDto>
{
    public SaveFeRequisitionDtoValidator()
    {
        RuleFor(x => x.VanDriverId)
            .NotEmpty();

        RuleFor(x => x.ShopId)
            .NotEmpty();

        RuleFor(x => x.VanDriverName)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.FeGeneralTasks)
            .NotEmpty()
            .WithMessage("At least one requisition row is required");
    }
}