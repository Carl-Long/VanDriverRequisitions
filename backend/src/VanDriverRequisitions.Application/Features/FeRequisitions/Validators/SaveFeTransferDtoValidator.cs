using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class SaveFeTransferDtoValidator : AbstractValidator<SaveFeTransferDto>
{
    public SaveFeTransferDtoValidator()
    {
        RuleFor(x => x.ShopIdFrom)
            .NotEmpty()
            .WithMessage("From shop is required.");

        RuleFor(x => x.ShopIdTo)
            .NotEmpty()
            .WithMessage("To shop is required.");

        RuleFor(x => x)
            .Must(x => x.ShopIdFrom != x.ShopIdTo)
            .WithMessage("From shop and to shop must be different.");

        RuleFor(x => x.Week)
            .NotNull();

        RuleFor(x => x.RatePerJob)
            .GreaterThanOrEqualTo(0)
            .When(x => x.RatePerJob.HasValue);
    }
}