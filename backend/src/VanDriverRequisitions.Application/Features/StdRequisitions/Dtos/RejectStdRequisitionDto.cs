namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class RejectStdRequisitionDto
{
    public byte[]? RowVersion { get; init; }
    public string RejectionNotes { get; init; } = string.Empty;
}