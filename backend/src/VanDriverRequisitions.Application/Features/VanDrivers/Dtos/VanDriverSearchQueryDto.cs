namespace VanDriverRequisitions.Application.Features.VanDrivers.Dtos;

public sealed class VanDriverSearchQueryDto
{
    public string? Search { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}