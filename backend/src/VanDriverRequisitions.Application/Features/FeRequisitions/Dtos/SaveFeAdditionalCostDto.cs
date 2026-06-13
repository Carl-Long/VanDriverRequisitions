using System.Text.Json.Serialization;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;

public sealed class SaveFeAdditionalCostDto
{
    public Guid? Id { get; set; }
    public DateOnly WeekEndingDate { get; init; }

    public Guid ReasonId { get; init; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ChargingOption ChargingOption { get; init; }

    public int? TotalNumber { get; init; }
    public decimal? RatePerJob { get; init; }

    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
}