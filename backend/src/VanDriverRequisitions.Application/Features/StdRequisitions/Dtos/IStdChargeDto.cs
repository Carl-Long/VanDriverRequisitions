using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;

public interface IStdChargeDto
{
    StdChargeType ChargeType { get; }
    int? Miles { get; }
    decimal? RatePerMile { get; }
    decimal? FlatCharge { get; }
}