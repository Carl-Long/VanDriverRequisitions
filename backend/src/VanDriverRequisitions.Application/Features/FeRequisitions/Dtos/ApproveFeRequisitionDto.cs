namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class ApproveFeRequisitionDto
{
    public required byte[] RowVersion { get; init; }
    public required string PoNumber { get; init; }
}