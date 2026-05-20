namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public class SaveFeRequisitionDto
{
    public DateOnly RequisitionDate { get; init; }
    public Guid VanDriverId { get; init; }
    public string VanDriverName { get; init; } = string.Empty;
    public Guid ShopId { get; init; }
    public bool IsVatApplicable { get; init; }
    public string? PoNumber { get; init; }

    public IReadOnlyList<SaveFeGeneralTaskDto> FeGeneralTasks { get; init; } = [];
    public IReadOnlyList<SaveFeMileageDto> FeMileages { get; init; } = [];
    public IReadOnlyList<SaveFeTransferDto> FeTransfers { get; init; } = [];
    public IReadOnlyList<SaveFeAdditionalCostDto> FeAdditionalCosts { get; init; } = [];
}
