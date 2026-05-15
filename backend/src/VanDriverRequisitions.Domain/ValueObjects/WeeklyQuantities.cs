namespace VanDriverRequisitions.Domain.ValueObjects;

public record WeeklyQuantities(
    int? Sunday,
    int? Monday,
    int? Tuesday,
    int? Wednesday,
    int? Thursday,
    int? Friday,
    int? Saturday)
{
    public int Total =>
        (Sunday ?? 0)
        + (Monday ?? 0)
        + (Tuesday ?? 0)
        + (Wednesday ?? 0)
        + (Thursday ?? 0)
        + (Friday ?? 0)
        + (Saturday ?? 0);
}