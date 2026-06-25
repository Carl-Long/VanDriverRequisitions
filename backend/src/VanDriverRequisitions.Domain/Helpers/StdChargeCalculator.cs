using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Helpers;

public readonly record struct StdChargeCalculation(int? Miles, decimal? RatePerMile, decimal? FlatCharge, decimal TotalValue);

public static class StdChargeCalculator
{
    public static StdChargeCalculation Calculate(StdChargeType chargeType, int? miles, decimal? ratePerMile, decimal? flatCharge)
    {
        return chargeType switch
        {
            StdChargeType.Mileage => CalculateMileage(miles, ratePerMile),
            StdChargeType.FlatCharge => CalculateFlatCharge(flatCharge),
            _ => throw new ArgumentOutOfRangeException(nameof(chargeType), chargeType, "Unknown STD charge type.")
        };
    }

    private static StdChargeCalculation CalculateMileage(int? miles, decimal? ratePerMile)
    {
        if (miles is not > 0)
        {
            throw new InvalidOperationException("Miles must be greater than zero.");
        }

        var validatedMiles = miles.Value;
        var validatedRatePerMile = MoneyGuard.EnsureRequiredMoneyAmount(ratePerMile, "Rate per mile");

        return new StdChargeCalculation(
            Miles: validatedMiles,
            RatePerMile: validatedRatePerMile,
            FlatCharge: null,
            TotalValue: validatedMiles * validatedRatePerMile);
    }

    private static StdChargeCalculation CalculateFlatCharge(decimal? flatCharge)
    {
        var validatedFlatCharge = MoneyGuard.EnsureRequiredMoneyAmount(flatCharge, "Flat charge");

        return new StdChargeCalculation(
            Miles: null,
            RatePerMile: null,
            FlatCharge: validatedFlatCharge,
            TotalValue: validatedFlatCharge);
    }
}