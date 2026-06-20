using System.Text.Json.Serialization;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Snapshots;

public sealed class StdCollectionChargeBanksAndBinsSnapshotDto
{
    public DateOnly Date { get; init; }

    public Guid CollectionTypeId { get; init; }
    public string CollectionTypeName { get; init; } = string.Empty;
    public string CollectionTypeCode { get; init; } = string.Empty;

    public Guid LocationId { get; init; }
    public string LocationName { get; init; } = string.Empty;
    public string LocationPostCode { get; init; } = string.Empty;

    public int? NumberOfBags { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public StdChargeType ChargeType { get; init; }

    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }

    public decimal? TotalValue { get; init; }
}