using FluentValidation;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Validators;

public class CreateSubmitWindowDtoValidator : AbstractValidator<CreateSubmitWindowDto>
{
    
    public CreateSubmitWindowDtoValidator()
    {
        RuleFor(x => x.OpenFrom)
            .GreaterThan(DateTime.UtcNow).WithMessage("Open from date must be in the future.");

        RuleFor(x => x.OpenTo)
            .GreaterThan(x => x.OpenFrom).WithMessage("Open to date must be after the open from date.");
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