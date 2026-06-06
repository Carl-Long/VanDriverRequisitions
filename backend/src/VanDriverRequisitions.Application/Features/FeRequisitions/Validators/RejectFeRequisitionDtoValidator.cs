using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class RejectFeRequisitionDtoValidator
    : AbstractValidator<RejectFeRequisitionDto>
{
    public RejectFeRequisitionDtoValidator()
    {
        RuleFor(x => x.RowVersion)
            .NotEmpty()
            .WithMessage("This requisition must be refreshed before it can be rejected.");

        RuleFor(x => x.RejectionNotes)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .WithMessage("Rejection notes are required.")
            .MaximumLength(1000)
            .WithMessage("Rejection notes cannot exceed 1000 characters.");
    }
}