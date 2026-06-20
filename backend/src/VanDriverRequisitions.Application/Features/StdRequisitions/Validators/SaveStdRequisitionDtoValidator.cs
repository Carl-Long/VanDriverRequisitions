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

        RuleFor(x => x)
            .Must(HaveAtLeastOneRow)
            .WithMessage("At least one requisition row is required.");

        RuleForEach(x => x.CollectionChargesBanksAndBins)
            .SetValidator(new SaveStdCollectionChargeBanksAndBinsDtoValidator());
        
        RuleForEach(x => x.CollectionVanPacks)
            .SetValidator(new SaveStdCollectionVanPackDtoValidator());
    }

    private static bool HaveAtLeastOneRow(SaveStdRequisitionDto dto)
    {
        return dto.CollectionChargesBanksAndBins.Any() || dto.CollectionVanPacks.Any();
    }
}