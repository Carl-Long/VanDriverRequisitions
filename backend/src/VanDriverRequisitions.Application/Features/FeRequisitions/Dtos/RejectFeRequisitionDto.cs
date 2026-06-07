namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class RejectFeRequisitionDto
{
    public byte[]? RowVersion { get; init; }
    public string RejectionNotes { get; init; } = string.Empty;
}