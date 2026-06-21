using System.Text.Json.Serialization;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;

public sealed record StdAdditionalCostSnapshotDto
{
    public DateOnly Date { get; init; }

    public Guid ReasonId { get; init; }
    public required string ReasonName { get; init; }

    public int NumberOfBags { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StdChargeType ChargeType { get; init; }

    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }

    public decimal TotalValue { get; init; }
}