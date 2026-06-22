using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed class SaveStdCollectionChargeBanksAndBinsDto : IStdChargeDto
{
    public Guid? Id { get; init; }
    public DateOnly Date { get; init; }
    public Guid CollectionTypeId { get; init; }
    public Guid LocationId { get; init; }
    public int? NumberOfBags { get; init; }
    public StdChargeType ChargeType { get; init; }
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }
}