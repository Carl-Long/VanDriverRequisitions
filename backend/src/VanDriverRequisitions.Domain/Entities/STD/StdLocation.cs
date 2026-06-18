using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Domain.Entities.STD;

public class StdLocation : LookupEntity
{
    public Guid CollectionTypeId { get; set; }
    public Guid ShopId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string PostCode { get; set; } = string.Empty;
}