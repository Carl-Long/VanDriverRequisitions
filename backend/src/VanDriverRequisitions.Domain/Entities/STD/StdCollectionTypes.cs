using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Domain.Entities.STD;

public class StdCollectionTypes : LookupEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}