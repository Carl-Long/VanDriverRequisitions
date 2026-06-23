using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class StdRequisitionQueryDtoValidator : AbstractValidator<StdRequisitionQueryDto>
{
    public StdRequisitionQueryDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.RequisitionNumber)
            .MaximumLength(50)
            .When(x => !string.IsNullOrWhiteSpace(x.RequisitionNumber))
            .WithMessage("Requisition number cannot exceed 50 characters.");

        RuleFor(x => x.Status)
            .IsInEnum()
            .When(x => x.Status.HasValue)
            .WithMessage("Invalid requisition status.");
    }
}