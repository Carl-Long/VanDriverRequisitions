using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Application.Common.Validation;

public static class MoneyValidationRules
{
    public const decimal MinimumMoneyAmount = MoneyGuard.MinimumMoneyAmount;

    public static bool HasMaxTwoDecimalPlaces(decimal value)
    {
        return MoneyGuard.HasMaxTwoDecimalPlaces(value);
    }
}