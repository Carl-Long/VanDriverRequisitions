using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class ApproveStdRequisitionDtoValidator : AbstractValidator<ApproveStdRequisitionDto>
{
    public ApproveStdRequisitionDtoValidator()
    {
        RuleFor(x => x.RowVersion)
            .NotEmpty()
            .WithMessage("This requisition must be refreshed before it can be approved.");
    }
}