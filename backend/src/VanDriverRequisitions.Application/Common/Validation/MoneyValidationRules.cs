namespace VanDriverRequisitions.Application.Common.Validation;

public static class MoneyValidationRules
{
    public const decimal MinimumMoneyAmount = 0.01m;

    public static bool HasMaxTwoDecimalPlaces(decimal value)
    {
        return decimal.Round(value, 2) == value;
    }
}