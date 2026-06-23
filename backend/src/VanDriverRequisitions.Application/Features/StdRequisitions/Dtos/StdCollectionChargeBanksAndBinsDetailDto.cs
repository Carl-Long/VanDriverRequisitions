using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class StdCollectionChargeBanksAndBinsDetailDto
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    
    public Guid CollectionTypeId { get; init; }
    public required string CollectionTypeName { get; init; }
    public required string CollectionTypeCode { get; init; }
    public bool IsCollectionTypeActive { get; init; }
    
    public Guid LocationId { get; init; }
    public required string LocationName { get; init; }
    public required string LocationPostCode { get; init; }
    public bool IsLocationActive { get; init; }

    public int? NumberOfBags { get; init; }

    public StdChargeType ChargeType { get; init; }
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }

    public decimal? TotalValue { get; init; }
}