using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeRequisition : ConcurrencyAwareEntity
{
    private FeRequisition() { } // EF

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

    public static FeRequisition Create(
        string requisitionNumber,
        RequisitionDetails details,
        IEnumerable<FeGeneralTaskUpdateModel> taskModels,
        IEnumerable<FeMileageUpdateModel> mileageModels)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(requisitionNumber);
        ArgumentNullException.ThrowIfNull(details);
        ArgumentNullException.ThrowIfNull(taskModels);
        ArgumentNullException.ThrowIfNull(mileageModels);

        var requisition = new FeRequisition
        {
            RequisitionNumber = requisitionNumber,
            Status = RequisitionStatus.Draft
        };

        requisition.UpdateDetails(details);
        requisition.SyncGeneralTasks(taskModels);
        requisition.SyncMileages(mileageModels);

        return requisition;
    }

    public void UpdateDetails(RequisitionDetails details)
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

    public void SyncGeneralTasks(IEnumerable<FeGeneralTaskUpdateModel> incomingTasks)
    {
        ArgumentNullException.ThrowIfNull(incomingTasks);

        var incomingList = incomingTasks.ToList();
        var existingTasks = _feGeneralTasks.ToDictionary(x => x.Id);

        var incomingIds = incomingList
            .Where(x => x.Id.HasValue)
            .Select(x => x.Id!.Value)
            .ToHashSet();

        var tasksToRemove = _feGeneralTasks
            .Where(x => !incomingIds.Contains(x.Id))
            .ToList();

        foreach (var task in tasksToRemove)
        {
            _feGeneralTasks.Remove(task);
        }

        foreach (var incoming in incomingList)
        {
            if (incoming.Id.HasValue)
            {
                if (!existingTasks.TryGetValue(incoming.Id.Value, out var existing))
                {
                    throw new InvalidOperationException($"Task '{incoming.Id}' not found.");
                }

                existing.Update(incoming.WeekEndingDate, incoming.Week, incoming.RatePerJob);
            }
            else
            {
                var task = FeGeneralTask.Create(
                    incoming.FeTaskTypeId,
                    incoming.TaskTypeName,
                    incoming.TaskTypeCode,
                    incoming.WeekEndingDate,
                    incoming.Week,
                    incoming.RatePerJob);

                _feGeneralTasks.Add(task);
            }
        }

        RecalculateSubtotal();
    }
    
    public void SyncMileages(IEnumerable<FeMileageUpdateModel> incomingMileages)
    {
        ArgumentNullException.ThrowIfNull(incomingMileages);

        var incomingList = incomingMileages.ToList();
        var existingMileages = _feMileages.ToDictionary(x => x.Id);

        var incomingIds = incomingList
            .Where(x => x.Id.HasValue)
            .Select(x => x.Id!.Value)
            .ToHashSet();

        var mileagesToRemove = _feMileages
            .Where(x => !incomingIds.Contains(x.Id))
            .ToList();

        foreach (var mileage in mileagesToRemove)
        {
            _feMileages.Remove(mileage);
        }

        foreach (var incoming in incomingList)
        {
            if (incoming.Id.HasValue)
            {
                if (!existingMileages.TryGetValue(incoming.Id.Value, out var existing))
                {
                    throw new InvalidOperationException($"Mileage '{incoming.Id}' not found.");
                }
                
                existing.Update(incoming.WeekEndingDate, incoming.Week, incoming.RatePerMile);
            }
            else
            {
                var mileage = FeMileage.Create(incoming.WeekEndingDate, incoming.Week, incoming.RatePerMile);
                _feMileages.Add(mileage);
            }
        }
        
        RecalculateSubtotal();
    }

    public void Submit(AuditUser submittedBy, DateTime submittedAtUtc, string snapshotJson)
    {
        ArgumentNullException.ThrowIfNull(submittedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(snapshotJson);

        if (!CanSubmit)
        {
            throw new InvalidOperationException("Only draft or rejected requisitions can be submitted.");
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
            ?? throw new InvalidOperationException("No pending submission exists.");

        submission.Approve(approvedBy, approvedAtUtc, poNumber);

        Approve(approvedBy, approvedAtUtc, poNumber);
    }

    public void RejectSubmission(AuditUser rejectedBy, DateTime rejectedAtUtc, string rejectionNotes)
    {
        ArgumentNullException.ThrowIfNull(rejectedBy);
        ArgumentException.ThrowIfNullOrWhiteSpace(rejectionNotes);

        var submission = PendingSubmission
            ?? throw new InvalidOperationException("No pending submission exists.");

        submission.Reject(rejectedBy, rejectedAtUtc, rejectionNotes);

        Reject(rejectedBy, rejectedAtUtc, rejectionNotes);
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