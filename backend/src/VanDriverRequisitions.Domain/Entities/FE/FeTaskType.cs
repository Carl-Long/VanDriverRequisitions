using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeTaskType : LookupEntity
{
    public required string Name { get; set; }
    public required string Code { get; set; }

    public Guid? DailyQuantityLimitId { get; set; }
    public LimitValue? DailyQuantityLimit { get; set; }

    public Guid? RateLimitId { get; set; }
    public LimitValue? RateLimit { get; set; }
}