using FluentValidation;
using VanDriverRequisitions.Application.Features.LimitValues.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.LimitValues.Validators;

public class CreateLimitValueDtoValidator : AbstractValidator<CreateLimitValueDto>
{
    public CreateLimitValueDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .Length(1, 100).WithMessage("Title must be between 1 and 100 characters.");

        RuleFor(x => x.NameOfValue)
            .NotEmpty().WithMessage("Name of value is required.")
            .Length(1, 100).WithMessage("Name of value must be between 1 and 100 characters.");

        RuleFor(x => x.TypeOfLimitation)
            .IsInEnum().WithMessage("Type of limitation must be a valid value.");

        RuleFor(x => x.Fascia)
            .IsInEnum().WithMessage("Fascia must be a valid value.")
            .When(x => x.Fascia.HasValue);

        RuleFor(x => x.NumericalLimit)
            .GreaterThanOrEqualTo(0).WithMessage("Numerical limit must be zero or greater.")
            .When(x => x.NumericalLimit.HasValue);

        RuleFor(x => x.CurrencyLimit)
            .GreaterThanOrEqualTo(0m).WithMessage("Currency limit must be zero or greater.")
            .When(x => x.CurrencyLimit.HasValue);

        RuleFor(x => x)
            .Must(x => x.NumericalLimit.HasValue ^ x.CurrencyLimit.HasValue)
            .WithName("Value")
            .WithMessage("Exactly one of NumericalLimit or CurrencyLimit must be provided.");
    }
}

public class UpdateLimitValueDtoValidator : AbstractValidator<UpdateLimitValueDto>
{
    public UpdateLimitValueDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .Length(1, 100).WithMessage("Title must be between 1 and 100 characters.");

        RuleFor(x => x.NameOfValue)
            .NotEmpty().WithMessage("Name of value is required.")
            .Length(1, 100).WithMessage("Name of value must be between 1 and 100 characters.");

        RuleFor(x => x.TypeOfLimitation)
            .IsInEnum().WithMessage("Type of limitation must be a valid value.");

        RuleFor(x => x.Fascia)
            .IsInEnum().WithMessage("Fascia must be a valid value.")
            .When(x => x.Fascia.HasValue);

        RuleFor(x => x.NumericalLimit)
            .GreaterThanOrEqualTo(0).WithMessage("Numerical limit must be zero or greater.")
            .When(x => x.NumericalLimit.HasValue);

        RuleFor(x => x.CurrencyLimit)
            .GreaterThanOrEqualTo(0m).WithMessage("Currency limit must be zero or greater.")
            .When(x => x.CurrencyLimit.HasValue);

        RuleFor(x => x)
            .Must(x => x.NumericalLimit.HasValue ^ x.CurrencyLimit.HasValue)
            .WithName("Value")
            .WithMessage("Exactly one of NumericalLimit or CurrencyLimit must be provided.");
    }
}
