namespace VanDriverRequisitions.Domain.Helpers;

public static class DateGuard
{
    public static DateOnly EnsureRequiredDate(DateOnly value, string label)
    {
        return value == default 
            ? throw new InvalidOperationException($"{label} is required.") 
            : value;
    }
}