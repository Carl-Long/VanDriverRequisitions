using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Helpers;
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
        var guardedOpenFrom = DateGuard.EnsureRequiredUtcDateTime(openFrom, "Open from");
        var guardedOpenTo = DateGuard.EnsureRequiredUtcDateTime(openTo, "Open to");

        if (guardedOpenTo <= guardedOpenFrom)
        {
            throw new InvalidOperationException("Submit window end must be after start.");
        }

        OpenFrom = guardedOpenFrom;
        OpenTo = guardedOpenTo;
    }
}