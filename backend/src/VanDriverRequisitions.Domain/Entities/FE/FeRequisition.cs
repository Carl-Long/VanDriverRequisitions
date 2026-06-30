using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;
using VanDriverRequisitions.Domain.Helpers;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeRequisition : ConcurrencyAwareEntity
{
    private FeRequisition()
    {
    } // EF

    public string RequisitionNumber { get; private set; } = string.Empty;

    public DateOnly RequisitionDate { get; private set; }
    public Guid VanDriverId { get; private set; }
    public string VanDriverName { get; private set; } = string.Empty;
    public string TradersName { get; private set; } = string.Empty;
    public string VanDriverCode { get; private set; } = string.Empty;

    public Guid ShopId { get; private set; }
    public string ShopCode { get; private set; } = string.Empty;
    public string ShopName { get; private set; } = string.Empty;

    public bool IsVatApplicable { get; private set; }

    public decimal Subtotal { get; private set; }
    public RequisitionStatus Status { get; private set; }

    public Guid? SubmittedById { get; private set; }
    public string? SubmittedByNameSnapshot { get; private set; }
    public DateTime? SubmittedAtUtc { get; private set; }

    public Guid? ApprovedById { get; private set; }
    public DateTime? ApprovedAtUtc { get; private set; }
    public string? ApprovedByNameSnapshot { get; private set; }
    public string? PoNumber { get; private set; }

    public Guid? RejectedById { get; private set; }
    public DateTime? RejectedAtUtc { get; private set; }
    public string? RejectedByNameSnapshot { get; private set; }
    public string? RejectionNotes { get; private set; }

    private readonly List<FeGeneralTask> _feGeneralTasks = [];
    private readonly List<FeMileage> _feMileages = [];
    private readonly List<FeTransfer> _feTransfers = [];
    private readonly List<FeAdditionalCost> _feAdditionalCosts = [];
    private readonly List<FeRequisitionSubmission> _submissions = [];

    public IReadOnlyCollection<FeGeneralTask> FeGeneralTasks => _feGeneralTasks;
    public IReadOnlyCollection<FeMileage> FeMileages => _feMileages;
    public IReadOnlyCollection<FeTransfer> FeTransfers => _feTransfers;
    public IReadOnlyCollection<FeAdditionalCost> FeAdditionalCosts => _feAdditionalCosts;
    public IReadOnlyCollection<FeRequisitionSubmission> Submissions => _submissions;

    public FeRequisitionSubmission? LatestSubmission => _submissions
        .OrderByDescending(x => x.SubmissionNumber)
        .FirstOrDefault();

    public FeRequisitionSubmission? PendingSubmission => _submissions
        .SingleOrDefault(x => x.Status == SubmissionStatus.Pending);

    public int NextSubmissionNumber => _submissions.Count == 0
        ? 1
        : _submissions.Max(x => x.SubmissionNumber) + 1;

    public bool CanSubmit => Status is RequisitionStatus.Draft or RequisitionStatus.Rejected;
    public bool CanEdit => Status is RequisitionStatus.Draft or RequisitionStatus.Rejected;

    public static FeRequisition Create(string requisitionNumber, FeRequisitionUpdateModel model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(requisitionNumber);
        ArgumentNullException.ThrowIfNull(model);

        var requisition = new FeRequisition
        {
            RequisitionNumber = requisitionNumber,
            Status = RequisitionStatus.Draft
        };

        requisition.Update(model);
        return requisition;
    }

    public void Update(FeRequisitionUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        if (!CanEdit)
        {
            throw new InvalidOperationException("This requisition can no longer be edited because it is not in Draft or Rejected status. Refresh the page to see the latest status.");
        }

        EnsureUpdateModelIsComplete(model);

        UpdateDetails(model.Details);
        SyncGeneralTasks(model.GeneralTasks);
        SyncMileages(model.Mileages);
        SyncTransfers(model.Transfers);
        SyncAdditionalCosts(model.AdditionalCosts);

        RecalculateSubtotal();
    }

    public void Submit(AuditUser submittedBy, DateTime submittedAtUtc, string snapshotJson)
    {
        ArgumentNullException.ThrowIfNull(submittedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(snapshotJson);

        EnsureCanSubmit();
        
        var submission = FeRequisitionSubmission.Create(NextSubmissionNumber, submittedBy, submittedAtUtc, snapshotJson);

        _submissions.Add(submission);

        SubmittedAtUtc = DateGuard.EnsureRequiredUtcDateTime(submittedAtUtc, "Submitted at UTC");
        Status = RequisitionStatus.Submitted;
        SubmittedById = submittedBy.Id;
        SubmittedByNameSnapshot = submittedBy.NameSnapshot;

        ClearRejection();
    }

    public void ApproveSubmission(AuditUser approvedBy, DateTime approvedAtUtc, string poNumber)
    {
        ArgumentNullException.ThrowIfNull(approvedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(poNumber);

        EnsureCanApprove();

        var submission = PendingSubmission 
                         ?? throw new InvalidOperationException("This requisition can no longer be approved because there is no pending submission. It may already have been approved or rejected by another user. Refresh the page to see the latest status");

        submission.Approve(approvedBy, approvedAtUtc, poNumber);

        ApplyApproval(approvedBy, approvedAtUtc, poNumber);
    }

    public void RejectSubmission(AuditUser rejectedBy, DateTime rejectedAtUtc, string rejectionNotes)
    {
        ArgumentNullException.ThrowIfNull(rejectedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(rejectionNotes);

        EnsureCanReject();

        var submission = PendingSubmission 
                         ?? throw new InvalidOperationException("This requisition can no longer be rejected because there is no pending submission. It may already have been approved or rejected by another user. Refresh the page to see the latest status.");

        submission.Reject(rejectedBy, rejectedAtUtc, rejectionNotes);

        ApplyRejection(rejectedBy, rejectedAtUtc, rejectionNotes);
    }

    private void UpdateDetails(RequisitionDetails details)
    {
        ArgumentNullException.ThrowIfNull(details);

        var driver = SnapshotGuard.EnsureRequiredVanDriver(details.Driver, "Driver");
        var shop = SnapshotGuard.EnsureRequiredShop(details.Shop, "Shop");

        RequisitionDate = DateGuard.EnsureRequiredDate(details.RequisitionDate, "Requisition date");

        VanDriverId = driver.Id;
        VanDriverCode = driver.Code;
        VanDriverName = driver.Name;
        TradersName = driver.TradersName;

        ShopId = shop.Id;
        ShopCode = shop.Code;
        ShopName = shop.Name;

        IsVatApplicable = driver.HasVat;
    }
    
    private static void EnsureUpdateModelIsComplete(FeRequisitionUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model.Details, nameof(model.Details));
        ArgumentNullException.ThrowIfNull(model.GeneralTasks, nameof(model.GeneralTasks));
        ArgumentNullException.ThrowIfNull(model.Mileages, nameof(model.Mileages));
        ArgumentNullException.ThrowIfNull(model.Transfers, nameof(model.Transfers));
        ArgumentNullException.ThrowIfNull(model.AdditionalCosts, nameof(model.AdditionalCosts));
    }
    
    private void SyncGeneralTasks(IEnumerable<FeGeneralTaskUpdateModel> incomingTasks)
    {
        ChildCollectionSyncHelper.Sync(
            _feGeneralTasks,
            incomingTasks,
            x => x.Id,
            (existing, incoming) =>
            {
                EnsureGeneralTaskTypeHasNotChanged(existing, incoming);
                existing.Update(incoming);
            },
            FeGeneralTask.Create,
            "Task");
    }
    
    private static void EnsureGeneralTaskTypeHasNotChanged(FeGeneralTask existing, FeGeneralTaskUpdateModel incoming)
    {
        if (existing.FeTaskTypeId == incoming.FeTaskTypeId)
        {
            return;
        }

        throw new InvalidOperationException("An existing FE general task row cannot be changed to a different task type.");
    }

    private void SyncMileages(IEnumerable<FeMileageUpdateModel> incomingMileages)
    {
        ChildCollectionSyncHelper.Sync(
            _feMileages,
            incomingMileages,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            FeMileage.Create,
            "Mileage");
    }

    private void SyncTransfers(IEnumerable<FeTransferUpdateModel> incomingTransfers)
    {
        ChildCollectionSyncHelper.Sync(
            _feTransfers,
            incomingTransfers,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            FeTransfer.Create,
            "Transfer");
    }

    private void SyncAdditionalCosts(IEnumerable<FeAdditionalCostUpdateModel> incomingAdditionalCosts)
    {
        ChildCollectionSyncHelper.Sync(
            _feAdditionalCosts,
            incomingAdditionalCosts,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            FeAdditionalCost.Create,
            "Additional cost");
    }
    
    private void EnsureCanSubmit()
    {
        if (Status is not RequisitionStatus.Draft and not RequisitionStatus.Rejected)
        {
            throw new InvalidOperationException("Only draft or rejected requisitions can be submitted.");
        }

        if (PendingSubmission is not null)
        {
            throw new InvalidOperationException("A pending submission already exists.");
        }

        if (Subtotal <= 0)
        {
            throw new InvalidOperationException("A requisition must have a subtotal greater than zero before it can be submitted.");
        }
    }
    
    private void EnsureCanApprove()
    {
        if (Status is not RequisitionStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requisitions can be approved.");
        }
    }

    private void ApplyApproval(AuditUser approvedBy, DateTime approvedAtUtc, string poNumber)
    {
        ApprovedAtUtc = DateGuard.EnsureRequiredUtcDateTime(approvedAtUtc, "Approved at UTC");
        Status = RequisitionStatus.Approved;
        ApprovedById = approvedBy.Id;
        ApprovedByNameSnapshot = approvedBy.NameSnapshot;
        PoNumber = poNumber;

        ClearRejection();
    }
    
    private void EnsureCanReject()
    {
        if (Status is not RequisitionStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requisitions can be rejected.");
        }
    }

    private void ApplyRejection(AuditUser rejectedBy, DateTime rejectedAtUtc, string rejectionNotes)
    {
        RejectedAtUtc = DateGuard.EnsureRequiredUtcDateTime(rejectedAtUtc, "Rejected at UTC");
        Status = RequisitionStatus.Rejected;
        RejectedById = rejectedBy.Id;
        RejectedByNameSnapshot = rejectedBy.NameSnapshot;
        RejectionNotes = rejectionNotes;

        ClearApproval();
    }

    private void ClearApproval()
    {
        ApprovedById = null;
        ApprovedByNameSnapshot = null;
        ApprovedAtUtc = null;
        PoNumber = null;
    }

    private void ClearRejection()
    {
        RejectedById = null;
        RejectedByNameSnapshot = null;
        RejectedAtUtc = null;
        RejectionNotes = null;
    }

    private void RecalculateSubtotal()
    {
        Subtotal = CalculateSubtotal();
    }

    private decimal CalculateSubtotal()
    {
        var generalTasksTotal = _feGeneralTasks.Sum(x => x.TotalValue ?? 0);
        var mileageTotal = _feMileages.Sum(x => x.TotalValue ?? 0);
        var transfersTotal = _feTransfers.Sum(x => x.TotalValue ?? 0);
        var additionalCostsTotal = _feAdditionalCosts.Sum(x => x.TotalValue ?? 0);

        return generalTasksTotal + mileageTotal + transfersTotal + additionalCostsTotal;
    }
}