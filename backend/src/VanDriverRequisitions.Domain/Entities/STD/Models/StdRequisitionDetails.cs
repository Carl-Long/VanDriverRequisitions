
using VanDriverRequisitions.Domain.Entities.Common.Models;

namespace VanDriverRequisitions.Domain.Entities.STD.Models;

public sealed record StdRequisitionDetails(DateOnly RequisitionDate, VanDriverSnapshot Driver, ShopSnapshot Shop);