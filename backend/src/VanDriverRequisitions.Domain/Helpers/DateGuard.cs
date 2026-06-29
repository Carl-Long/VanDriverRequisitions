namespace VanDriverRequisitions.Domain.Helpers;

public static class DateGuard
{
    public static DateOnly EnsureRequiredDate(DateOnly value, string label)
    {
        return value == default 
            ? throw new InvalidOperationException($"{label} is required.") 
            : value;
    }

    public static DateTime EnsureRequiredUtcDateTime(DateTime value, string label)
    {
        if (value == default)
        {
            throw new InvalidOperationException($"{label} is required.");
        }

        return value.Kind != DateTimeKind.Utc 
            ? throw new InvalidOperationException($"{label} must be UTC.") 
            : value;
    }
}