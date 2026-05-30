using VanDriverRequisitions.Domain.Entities.Common.Models;

namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed record RequisitionDetails(
    DateOnly RequisitionDate,
    VanDriverSnapshot Driver,
    ShopSnapshot Shop);