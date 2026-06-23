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

        if (ratePerMile is null or < 0)
        {
            throw new InvalidOperationException("Rate per mile is required and cannot be negative.");
        }

        return new StdChargeCalculation(
            Miles: miles.Value,
            RatePerMile: ratePerMile.Value,
            FlatCharge: null,
            TotalValue: miles.Value * ratePerMile.Value);
    }

    private static StdChargeCalculation CalculateFlatCharge(decimal? flatCharge)
    {
        if (!flatCharge.HasValue)
        {
            throw new InvalidOperationException("Flat charge is required.");
        }

        return flatCharge.Value < 0 
            ? throw new InvalidOperationException("Flat charge cannot be negative.") 
            : new StdChargeCalculation(Miles: null, RatePerMile: null, FlatCharge: flatCharge.Value, TotalValue: flatCharge.Value);
    }
}