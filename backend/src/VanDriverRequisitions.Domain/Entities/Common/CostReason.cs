using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class CostReason : LookupEntity
{
    public string Code { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public CostReasonScope Scope { get; set; }
    
    public bool AppliesToFe()
    {
        return Scope is CostReasonScope.Fe or CostReasonScope.Shared;
    }
    
    public bool AppliesToStd()
    {
        return Scope is CostReasonScope.Std or CostReasonScope.Shared;
    }
}