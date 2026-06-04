using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeGeneralTaskDtoValidator
    : AbstractValidator<SaveFeGeneralTaskDto>
{
    public SaveFeGeneralTaskDtoValidator()
    {
        RuleFor(x => x.FeTaskTypeId)
            .NotEmpty();

        RuleFor(x => x.WeekEndingDate)
            .NotEmpty();

        RuleFor(x => x.RatePerJob)
            .GreaterThanOrEqualTo(0)
            .When(x => x.RatePerJob.HasValue);
    }
}