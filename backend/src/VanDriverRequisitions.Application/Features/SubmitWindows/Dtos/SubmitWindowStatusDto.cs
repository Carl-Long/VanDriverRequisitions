namespace VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

public class SubmitWindowStatusDto
{
    public SubmitWindowSummaryDto? CurrentWindow { get; init; }
    public SubmitWindowSummaryDto? NextWindow { get; init; }
    public bool HasUpcoming { get; init; }
}
