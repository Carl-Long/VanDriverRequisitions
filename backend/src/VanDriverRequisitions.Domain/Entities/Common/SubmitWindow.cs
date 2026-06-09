using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Interfaces;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class SubmitWindow : AuditableEntity, ISoftDeletable
{
    private SubmitWindow() { } // EF

    public DateTime OpenFrom { get; private set; }
    public DateTime OpenTo { get; private set; }
    public DateTime? DeletedAtUtc { get; set; }
    public Guid? DeletedById { get; set; }
    public string? DeletedByNameSnapshot { get; set; }

    public static SubmitWindow Create(DateTime openFrom, DateTime openTo)
    {
        var window = new SubmitWindow();
        window.Update(openFrom, openTo);
        return window;
    }

    public void Update(DateTime openFrom, DateTime openTo)
    {
        if (openTo <= openFrom)
        {
            throw new InvalidOperationException("Submit window end must be after start.");
        }
        
        OpenFrom = openFrom;
        OpenTo = openTo;
    }
}