namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class SaveFeRequisitionDto
{
    public DateOnly RequisitionDate { get; init; }
    public byte[] RowVersion {get; init;} = [];
    public Guid VanDriverId { get; init; }
    public required string VanDriverName { get; init; }
    public Guid ShopId { get; init; }
    public required List<SaveFeGeneralTaskDto> FeGeneralTasks { get; init; }
}