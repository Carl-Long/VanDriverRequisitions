using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeReason : LookupEntity
{
    public required string Reason { get; set; }
}