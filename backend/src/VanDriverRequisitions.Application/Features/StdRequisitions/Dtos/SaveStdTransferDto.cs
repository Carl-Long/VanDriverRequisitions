using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public sealed record SaveStdTransferDto : IStdChargeDto
{
    public Guid? Id { get; init; }
    public DateOnly Date { get; init; }
    public Guid ShopIdFrom { get; init; }
    public Guid ShopIdTo { get; init; }
    public int? NumberOfBags { get; init; }
    public int? NumberOfBoxes { get; init; }
    public StdChargeType ChargeType { get; init; }
    public int? Miles { get; init; }
    public decimal? RatePerMile { get; init; }
    public decimal? FlatCharge { get; init; }
}