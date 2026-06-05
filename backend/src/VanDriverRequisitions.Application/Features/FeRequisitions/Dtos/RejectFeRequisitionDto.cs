namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class RejectFeRequisitionDto
{
    public required byte[] RowVersion { get; init; }
    public required string RejectionNotes { get; init; }
}