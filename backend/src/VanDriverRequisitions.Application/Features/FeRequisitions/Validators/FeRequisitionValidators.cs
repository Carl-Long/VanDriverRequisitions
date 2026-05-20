using FluentValidation;
using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public class SaveFeGeneralTaskDtoValidator : AbstractValidator<SaveFeGeneralTaskDto>
{
    public SaveFeGeneralTaskDtoValidator()
    {
        RuleFor(x => x.FeTaskTypeId).NotEmpty().WithMessage("Task type is required.");
        RuleFor(x => x.WeekEndingDate).NotEmpty().WithMessage("Week ending date is required.");
        RuleFor(x => x.RatePerJob)
            .NotNull().WithMessage("Rate per job is required.")
            .GreaterThanOrEqualTo(0).When(x => x.RatePerJob.HasValue)
            .WithMessage("Rate per job must be zero or positive.");
        RuleFor(x => x.Week)
            .Must(HasAtLeastOneQuantity).WithMessage("At least one day must have a quantity.");
    }

    private static bool HasAtLeastOneQuantity(WeeklyQuantitiesDto w) =>
        (w.Sunday ?? 0) + (w.Monday ?? 0) + (w.Tuesday ?? 0) + (w.Wednesday ?? 0)
        + (w.Thursday ?? 0) + (w.Friday ?? 0) + (w.Saturday ?? 0) > 0;
}

public class SaveFeMileageDtoValidator : AbstractValidator<SaveFeMileageDto>
{
    public SaveFeMileageDtoValidator()
    {
        RuleFor(x => x.WeekEndingDate).NotEmpty().WithMessage("Week ending date is required.");
        RuleFor(x => x.RatePerMile)
            .NotNull().WithMessage("Rate per mile is required.")
            .GreaterThanOrEqualTo(0).When(x => x.RatePerMile.HasValue)
            .WithMessage("Rate per mile must be zero or positive.");
        RuleFor(x => x.Week)
            .Must(w => (w.Sunday ?? 0) + (w.Monday ?? 0) + (w.Tuesday ?? 0) + (w.Wednesday ?? 0)
                + (w.Thursday ?? 0) + (w.Friday ?? 0) + (w.Saturday ?? 0) > 0)
            .WithMessage("At least one day must have miles.");
    }
}

public class SaveFeTransferDtoValidator : AbstractValidator<SaveFeTransferDto>
{
    public SaveFeTransferDtoValidator()
    {
        RuleFor(x => x.WeekEndingDate).NotEmpty().WithMessage("Week ending date is required.");
        RuleFor(x => x.ShopIdFrom).NotEmpty().WithMessage("From shop is required.");
        RuleFor(x => x.ShopIdTo).NotEmpty().WithMessage("To shop is required.");
        RuleFor(x => x).Must(x => x.ShopIdFrom != x.ShopIdTo)
            .WithMessage("From and To shops must be different.")
            .WithName(nameof(SaveFeTransferDto.ShopIdTo));
        RuleFor(x => x.RatePerJob)
            .NotNull().WithMessage("Rate per job is required.")
            .GreaterThanOrEqualTo(0).When(x => x.RatePerJob.HasValue);
        RuleFor(x => x.Week)
            .Must(w => (w.Sunday ?? 0) + (w.Monday ?? 0) + (w.Tuesday ?? 0) + (w.Wednesday ?? 0)
                + (w.Thursday ?? 0) + (w.Friday ?? 0) + (w.Saturday ?? 0) > 0)
            .WithMessage("At least one day must have a quantity.");
    }
}

public class SaveFeAdditionalCostDtoValidator : AbstractValidator<SaveFeAdditionalCostDto>
{
    public SaveFeAdditionalCostDtoValidator()
    {
        RuleFor(x => x.WeekEndingDate).NotEmpty().WithMessage("Week ending date is required.");
        RuleFor(x => x.ReasonId).NotEmpty().WithMessage("Reason is required.");
        RuleFor(x => x.ChargingOption).IsInEnum().WithMessage("Charging option is invalid.");

        When(x => x.ChargingOption == ChargingOption.Job, () =>
        {
            RuleFor(x => x.TotalNumber)
                .NotNull().WithMessage("Number of jobs is required.")
                .GreaterThan(0).When(x => x.TotalNumber.HasValue);
            RuleFor(x => x.RatePerJob)
                .NotNull().WithMessage("Rate per job is required.")
                .GreaterThanOrEqualTo(0).When(x => x.RatePerJob.HasValue);
        });

        When(x => x.ChargingOption == ChargingOption.Mileage, () =>
        {
            RuleFor(x => x.Miles)
                .NotNull().WithMessage("Miles are required.")
                .GreaterThan(0).When(x => x.Miles.HasValue);
            RuleFor(x => x.RatePerMile)
                .NotNull().WithMessage("Rate per mile is required.")
                .GreaterThanOrEqualTo(0).When(x => x.RatePerMile.HasValue);
        });
    }
}

public class SaveFeRequisitionDtoValidator : AbstractValidator<SaveFeRequisitionDto>
{
    public SaveFeRequisitionDtoValidator()
    {
        RuleFor(x => x.RequisitionDate).NotEmpty().WithMessage("Requisition date is required.");
        RuleFor(x => x.VanDriverId).NotEmpty().WithMessage("Van driver is required.");
        RuleFor(x => x.VanDriverName).NotEmpty().WithMessage("Van driver name is required.")
            .MaximumLength(200);
        RuleFor(x => x.ShopId).NotEmpty().WithMessage("Shop is required.");

        RuleForEach(x => x.FeGeneralTasks).SetValidator(new SaveFeGeneralTaskDtoValidator());
        RuleForEach(x => x.FeMileages).SetValidator(new SaveFeMileageDtoValidator());
        RuleForEach(x => x.FeTransfers).SetValidator(new SaveFeTransferDtoValidator());
        RuleForEach(x => x.FeAdditionalCosts).SetValidator(new SaveFeAdditionalCostDtoValidator());
    }
}
