using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeTaskType : LookupEntity
{
    public required string Name { get; set; }
    public required string Code { get; set; }
}