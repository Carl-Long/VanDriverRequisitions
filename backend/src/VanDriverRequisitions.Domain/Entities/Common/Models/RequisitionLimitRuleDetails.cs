using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.Common.Models;

public sealed record RequisitionLimitRuleDetails(
    RequisitionRowCategory Category,
    Guid? FeTaskTypeId,
    Fascia Fascia,
    int MaxQuantity,
    decimal MaxRate);