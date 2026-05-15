namespace VanDriverRequisitions.Domain.Entities.FE;

public class FeMileage : AuditableEntity
{
    public Guid FeRequisitionId { get; set; }
    public DateOnly JobDate { get; set; } =  DateOnly.FromDateTime(DateTime.Now);
    
    public int? Sunday { get; set; }
    public int? Monday { get; set; }
    public int? Tuesday { get; set; }
    public int? Wednesday { get; set; }
    public int? Thursday { get; set; }
    public int? Friday { get; set; }
    public int? Saturday { get; set; }
    
    public int? TotalMiles  { get; set; }
    public decimal? RatePerMile { get; set; }
    public decimal? TotalValue { get; set; }
}