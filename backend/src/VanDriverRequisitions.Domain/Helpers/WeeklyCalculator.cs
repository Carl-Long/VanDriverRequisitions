namespace VanDriverRequisitions.Domain.Helpers;

public static class WeeklyCalculator
{
    public static decimal Calculate(int quantity, decimal? rate) => quantity * (rate ?? 0);
}