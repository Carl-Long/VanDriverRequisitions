namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed class WeeklyQuantitiesSnapshot
{
    public int Saturday { get; init; }
    public int Sunday { get; init; }
    public int Monday { get; init; }
    public int Tuesday { get; init; }
    public int Wednesday { get; init; }
    public int Thursday { get; init; }
    public int Friday { get; init; }
}