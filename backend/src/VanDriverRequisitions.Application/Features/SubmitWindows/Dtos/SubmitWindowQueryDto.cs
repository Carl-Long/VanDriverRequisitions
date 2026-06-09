using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;

public sealed class SubmitWindowQueryDto
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public SubmitWindowFilter Filter { get; init; } = SubmitWindowFilter.Active;
}