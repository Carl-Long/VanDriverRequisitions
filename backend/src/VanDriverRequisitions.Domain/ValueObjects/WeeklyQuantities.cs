namespace VanDriverRequisitions.Domain.ValueObjects;

public sealed record WeeklyQuantities
{
    private WeeklyQuantities()
    {
        // EF Core
    }

    public WeeklyQuantities(int? sunday, int? monday, int? tuesday, int? wednesday, int? thursday, int? friday, int? saturday)
    {
        Sunday = EnsureNonNegative(sunday, nameof(sunday));
        Monday = EnsureNonNegative(monday, nameof(monday));
        Tuesday = EnsureNonNegative(tuesday, nameof(tuesday));
        Wednesday = EnsureNonNegative(wednesday, nameof(wednesday));
        Thursday = EnsureNonNegative(thursday, nameof(thursday));
        Friday = EnsureNonNegative(friday, nameof(friday));
        Saturday = EnsureNonNegative(saturday, nameof(saturday));
    }

    public int? Sunday { get; private set; }
    public int? Monday { get; private set; }
    public int? Tuesday { get; private set; }
    public int? Wednesday { get; private set; }
    public int? Thursday { get; private set; }
    public int? Friday { get; private set; }
    public int? Saturday { get; private set; }

    public int Total =>
        (Sunday ?? 0)
        + (Monday ?? 0)
        + (Tuesday ?? 0)
        + (Wednesday ?? 0)
        + (Thursday ?? 0)
        + (Friday ?? 0)
        + (Saturday ?? 0);

    private static int? EnsureNonNegative(int? value, string paramName)
    {
        return value is < 0 
            ? throw new ArgumentOutOfRangeException(paramName, value, "Weekly quantities cannot be negative.") 
            : value;
    }
}