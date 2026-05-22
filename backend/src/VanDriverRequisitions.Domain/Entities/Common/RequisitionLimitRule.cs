using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class RequisitionLimitRule : LookupEntity
{
    public RequisitionRowCategory Category { get; set; }
    public Guid? FeTaskTypeId { get; set; }
    public FeTaskType? FeTaskType { get; set; }
    public Fascia? Fascia { get; set; }
    public int? MaxQuantity { get; set; }
    public decimal? MaxRate { get; set; }
}