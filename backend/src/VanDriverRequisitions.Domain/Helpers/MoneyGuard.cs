namespace VanDriverRequisitions.Domain.Helpers;

public static class MoneyGuard
{
    public const decimal MinimumMoneyAmount = 0.01m;

    public static decimal? EnsureOptionalMoneyAmount(decimal? value, string label)
    {
        if (!value.HasValue)
        {
            return null;
        }

        return EnsureMoneyAmount(value.Value, label);
    }

    public static decimal EnsureRequiredMoneyAmount(decimal? value, string label)
    {
        return !value.HasValue 
            ? throw new InvalidOperationException($"{label} is required.") 
            : EnsureMoneyAmount(value.Value, label);
    }

    public static decimal EnsureMoneyAmount(decimal value, string label)
    {
        if (value < MinimumMoneyAmount)
        {
            throw new InvalidOperationException($"{label} must be at least £0.01.");
        }

        return !HasMaxTwoDecimalPlaces(value) 
            ? throw new InvalidOperationException($"{label} can have a maximum of 2 decimal places.") 
            : value;
    }

    public static bool HasMaxTwoDecimalPlaces(decimal value)
    {
        return decimal.Round(value, 2) == value;
    }
}