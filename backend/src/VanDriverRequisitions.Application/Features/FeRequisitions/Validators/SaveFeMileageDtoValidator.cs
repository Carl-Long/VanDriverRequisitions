using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeMileageDtoValidator : AbstractValidator<SaveFeMileageDto>
{
    public SaveFeMileageDtoValidator()
    {
        RuleFor(x => x.Week)
            .NotNull();

        RuleFor(x => x.RatePerMile)
            .GreaterThanOrEqualTo(0)
            .When(x => x.RatePerMile.HasValue);
    }
}