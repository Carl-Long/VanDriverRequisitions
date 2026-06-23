using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed record StdPickupDetailDto
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    public int NumberOfBags { get; init; }
    public int NumberOfHouseholds { get; init; } 
    public StdChargeType ChargeType { get; init; }
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }
    public decimal TotalValue { get; init; }
}