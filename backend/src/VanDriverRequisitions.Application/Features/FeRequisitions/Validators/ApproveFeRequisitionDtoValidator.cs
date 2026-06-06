using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class ApproveFeRequisitionDtoValidator
    : AbstractValidator<ApproveFeRequisitionDto>
{
    public ApproveFeRequisitionDtoValidator()
    {
        RuleFor(x => x.RowVersion)
            .NotEmpty()
            .WithMessage("This requisition must be refreshed before it can be approved.");
    }
}