using FluentValidation;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Validators;

public class CreateSubmitWindowDtoValidator : AbstractValidator<CreateSubmitWindowDto>
{
    public CreateSubmitWindowDtoValidator(TimeProvider timeProvider)
    {
        RuleFor(x => x.OpenFrom)
            .Must(openFrom => openFrom > timeProvider.GetUtcDateTime())
            .WithMessage("Open from date must be in the future.");

        RuleFor(x => x.OpenTo)
            .GreaterThan(x => x.OpenFrom)
            .WithMessage("Open to date must be after the open from date.");
    }
}

public class UpdateSubmitWindowDtoValidator : AbstractValidator<UpdateSubmitWindowDto>
{
    public UpdateSubmitWindowDtoValidator()
    {
        RuleFor(x => x.OpenTo)
            .GreaterThan(x => x.OpenFrom).WithMessage("Open to date must be after the open from date.");
    }
}

public class SubmitWindowQueryDtoValidator : AbstractValidator<SubmitWindowQueryDto>
{
    public SubmitWindowQueryDtoValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.Filter)
            .IsInEnum()
            .WithMessage("Invalid submit window filter.");
    }
}