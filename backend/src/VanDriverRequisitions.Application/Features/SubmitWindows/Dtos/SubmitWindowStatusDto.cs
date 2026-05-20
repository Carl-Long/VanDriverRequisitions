namespace VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

public class SubmitWindowStatusDto
{
    public SubmitWindowDto? CurrentWindow { get; init; }
    public SubmitWindowDto? NextWindow { get; init; }
    public bool HasUpcoming { get; init; }
}
