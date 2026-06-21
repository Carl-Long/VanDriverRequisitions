using System.Text.Json.Serialization;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed record SaveStdPickupDto
{
    public Guid? Id { get; init; }
    public DateOnly Date { get; init; }
    public int NumberOfBags { get; init; }
    public int NumberOfHouseholds { get; init; }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StdChargeType ChargeType { get; init; }
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }
}