using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

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
            throw new InvalidOperationException(
                "This requisition can no longer be edited because it is not in Draft or Rejected status. Refresh the page to see the latest status.");
        }

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

        if (!CanSubmit)
        {
            throw new InvalidOperationException
                ("This requisition can no longer be submitted because it is not in Draft or Rejected status. It may have already been submitted by another user. Refresh the page to see the latest status.");
        }

        if (PendingSubmission is not null)
        {
            throw new InvalidOperationException("A pending submission already exists.");
        }

        var submission = FeRequisitionSubmission.Create(NextSubmissionNumber, submittedBy, submittedAtUtc, snapshotJson);

        _submissions.Add(submission);

        Status = RequisitionStatus.Submitted;
        SubmittedById = submittedBy.Id;
        SubmittedByNameSnapshot = submittedBy.NameSnapshot;
        SubmittedAtUtc = submittedAtUtc;

        ClearRejection();
    }

    public void ApproveSubmission(AuditUser approvedBy, DateTime approvedAtUtc, string poNumber)
    {
        ArgumentNullException.ThrowIfNull(approvedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(poNumber);

        var submission = PendingSubmission 
                         ?? throw new InvalidOperationException("This requisition can no longer be approved because there is no pending submission. It may already have been approved or rejected by another user. Refresh the page to see the latest status");

        submission.Approve(approvedBy, approvedAtUtc, poNumber);

        Approve(approvedBy, approvedAtUtc, poNumber);
    }

    public void RejectSubmission(AuditUser rejectedBy, DateTime rejectedAtUtc, string rejectionNotes)
    {
        ArgumentNullException.ThrowIfNull(rejectedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(rejectionNotes);

        var submission = PendingSubmission 
                         ?? throw new InvalidOperationException("This requisition can no longer be rejected because there is no pending submission. It may already have been approved or rejected by another user. Refresh the page to see the latest status.");

        submission.Reject(rejectedBy, rejectedAtUtc, rejectionNotes);

        Reject(rejectedBy, rejectedAtUtc, rejectionNotes);
    }

    private void UpdateDetails(RequisitionDetails details)
    {
        ArgumentNullException.ThrowIfNull(details);

        RequisitionDate = details.RequisitionDate;

        VanDriverId = details.Driver.Id;
        VanDriverCode = details.Driver.Code;
        VanDriverName = details.Driver.Name;
        TradersName = details.Driver.TradersName;

        ShopId = details.Shop.Id;
        ShopCode = details.Shop.Code;
        ShopName = details.Shop.Name;

        IsVatApplicable = details.Driver.HasVat;
    }

    private void SyncGeneralTasks(IEnumerable<FeGeneralTaskUpdateModel> incomingTasks)
    {
        SyncChildren(
            _feGeneralTasks,
            incomingTasks,
            x => x.Id,
            (existing, incoming) => existing.Update(
                incoming.WeekEndingDate,
                incoming.Week,
                incoming.RatePerJob),
            incoming => FeGeneralTask.Create(
                incoming.FeTaskTypeId,
                incoming.TaskTypeName,
                incoming.TaskTypeCode,
                incoming.WeekEndingDate,
                incoming.Week,
                incoming.RatePerJob),
            "Task");
    }

    private void SyncMileages(IEnumerable<FeMileageUpdateModel> incomingMileages)
    {
        SyncChildren(
            _feMileages,
            incomingMileages,
            x => x.Id,
            (existing, incoming) => existing.Update(
                incoming.WeekEndingDate,
                incoming.Week,
                incoming.RatePerMile),
            incoming => FeMileage.Create(
                incoming.WeekEndingDate,
                incoming.Week,
                incoming.RatePerMile),
            "Mileage");
    }

    private void SyncTransfers(IEnumerable<FeTransferUpdateModel> incomingTransfers)
    {
        SyncChildren(
            _feTransfers,
            incomingTransfers,
            x => x.Id,
            (existing, incoming) => existing.Update(
                incoming.FromShop,
                incoming.ToShop,
                incoming.WeekEndingDate,
                incoming.Week,
                incoming.RatePerJob),
            incoming => FeTransfer.Create(
                incoming.FromShop,
                incoming.ToShop,
                incoming.WeekEndingDate,
                incoming.Week,
                incoming.RatePerJob),
            "Transfer");
    }

    private void SyncAdditionalCosts(IEnumerable<FeAdditionalCostUpdateModel> incomingAdditionalCosts)
    {
        SyncChildren(
            _feAdditionalCosts,
            incomingAdditionalCosts,
            x => x.Id,
            (existing, incoming) => existing.Update(
                incoming.WeekEndingDate,
                incoming.ReasonId,
                incoming.ReasonCodeSnapshot,
                incoming.ReasonTextSnapshot,
                incoming.ChargingOption,
                incoming.TotalNumber,
                incoming.RatePerJob,
                incoming.Miles,
                incoming.RatePerMile),
            incoming => FeAdditionalCost.Create(
                incoming.WeekEndingDate,
                incoming.ReasonId,
                incoming.ReasonCodeSnapshot,
                incoming.ReasonTextSnapshot,
                incoming.ChargingOption,
                incoming.TotalNumber,
                incoming.RatePerJob,
                incoming.Miles,
                incoming.RatePerMile),
            "Additional cost");
    }

    private static void SyncChildren<TChild, TIncoming>(
        List<TChild> children,
        IEnumerable<TIncoming> incomingItems,
        Func<TIncoming, Guid?> getId,
        Action<TChild, TIncoming> updateExisting,
        Func<TIncoming, TChild> createNew,
        string childName)
        where TChild : AuditableEntity
    {
        ArgumentNullException.ThrowIfNull(incomingItems);

        var incomingList = incomingItems.ToList();
        var existingChildren = GetPersistedChildrenById(children);
        var incomingIds = GetIncomingIds(incomingList, getId);

        var childrenToRemove = children
            .Where(x => x.Id == Guid.Empty || !incomingIds.Contains(x.Id))
            .ToList();

        foreach (var child in childrenToRemove)
        {
            children.Remove(child);
        }

        foreach (var incoming in incomingList)
        {
            var id = getId(incoming);

            if (IsExistingChild(id))
            {
                if (!existingChildren.TryGetValue(id!.Value, out var existing))
                {
                    throw new InvalidOperationException($"{childName} '{id}' not found.");
                }

                updateExisting(existing, incoming);
            }
            else
            {
                children.Add(createNew(incoming));
            }
        }
    }

    private static Dictionary<Guid, TChild> GetPersistedChildrenById<TChild>(IEnumerable<TChild> children) where TChild : AuditableEntity
    {
        return children.Where(x => x.Id != Guid.Empty).ToDictionary(x => x.Id);
    }

    private static HashSet<Guid> GetIncomingIds<TIncoming>(IEnumerable<TIncoming> incomingItems, Func<TIncoming, Guid?> getId)
    {
        return incomingItems
            .Select(getId)
            .Where(IsExistingChild)
            .Select(id => id!.Value)
            .ToHashSet();
    }

    private static bool IsExistingChild(Guid? id)
    {
        return id.HasValue && id.Value != Guid.Empty;
    }

    private void Approve(AuditUser approvedBy, DateTime approvedAtUtc, string poNumber)
    {
        if (Status != RequisitionStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requisitions can be approved.");
        }

        Status = RequisitionStatus.Approved;
        ApprovedById = approvedBy.Id;
        ApprovedByNameSnapshot = approvedBy.NameSnapshot;
        ApprovedAtUtc = approvedAtUtc;
        PoNumber = poNumber;

        ClearRejection();
    }

    private void Reject(AuditUser rejectedBy, DateTime rejectedAtUtc, string rejectionNotes)
    {
        if (Status != RequisitionStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requisitions can be rejected.");
        }

        Status = RequisitionStatus.Rejected;
        RejectedById = rejectedBy.Id;
        RejectedByNameSnapshot = rejectedBy.NameSnapshot;
        RejectedAtUtc = rejectedAtUtc;
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