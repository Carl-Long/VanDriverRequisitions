using FluentValidation;
using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class SaveStdRequisitionDtoValidator : AbstractValidator<SaveStdRequisitionDto>
{
    public SaveStdRequisitionDtoValidator()
    {
        RuleFor(x => x.RequisitionDate)
            .NotEmpty()
            .WithMessage("Requisition date is required.");

        RuleFor(x => x.VanDriverId)
            .NotEmpty()
            .WithMessage("Van driver is required.");

        RuleFor(x => x.VanDriverName)
            .NotEmpty()
            .WithMessage("Van driver name is required.")
            .MaximumLength(100)
            .WithMessage("Van driver name cannot exceed 100 characters.");

        RuleFor(x => x.ShopId)
            .NotEmpty()
            .WithMessage("Shop is required.");

        RuleFor(x => x.CollectionChargesBanksAndBins)
            .NotNull()
            .WithMessage("Collection charges are required.");

        RuleFor(x => x.CollectionVanPacks)
            .NotNull()
            .WithMessage("Van pack collections are required.");

        RuleFor(x => x.Pickups)
            .NotNull()
            .WithMessage("Pickup collections are required.");

        RuleFor(x => x.Transfers)
            .NotNull()
            .WithMessage("Transfers are required.");

        RuleFor(x => x.AdditionalCosts)
            .NotNull()
            .WithMessage("Additional costs are required.");

        RuleFor(x => x)
            .Must(HaveAtLeastOneRow)
            .WithMessage("At least one requisition row is required.");

        RuleForEach(x => x.CollectionChargesBanksAndBins)
            .SetValidator(new SaveStdCollectionChargeBanksAndBinsDtoValidator());

        RuleForEach(x => x.CollectionVanPacks)
            .SetValidator(new SaveStdCollectionVanPackDtoValidator());

        RuleForEach(x => x.Pickups)
            .SetValidator(new SaveStdPickupDtoValidator());

        RuleForEach(x => x.Transfers)
            .SetValidator(new SaveStdTransferDtoValidator());

        RuleForEach(x => x.AdditionalCosts)
            .SetValidator(new SaveStdAdditionalCostDtoValidator());
    }

    private static bool HaveAtLeastOneRow(SaveStdRequisitionDto dto)
    {
        return dto.CollectionChargesBanksAndBins?.Any() == true
               || dto.CollectionVanPacks?.Any() == true
               || dto.Pickups?.Any() == true
               || dto.Transfers?.Any() == true
               || dto.AdditionalCosts?.Any() == true;
    }
}