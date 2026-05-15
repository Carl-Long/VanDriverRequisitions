namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeTransfer : AuditableEntity
{
    public Guid FeRequisitionId { get; set; }
    public DateOnly JobDate { get; set; } =  DateOnly.FromDateTime(DateTime.Now);
    public Guid ShopIdFrom { get; set; }
    public Guid ShopIdTo { get; set; }
    
    public int? Sunday { get; set; }
    public int? Monday { get; set; }
    public int? Tuesday { get; set; }
    public int? Wednesday { get; set; }
    public int? Thursday { get; set; }
    public int? Friday { get; set; }
    public int? Saturday { get; set; }
    
    public int? TotalNumber  { get; set; }
    public decimal? RatePerJob { get; set; }
    public decimal? TotalValue { get; set; }
}