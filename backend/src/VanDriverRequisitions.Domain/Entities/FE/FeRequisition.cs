using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.FE;

public sealed class FeRequisition : ConcurrencyAwareEntity
{
    public required string RequisitionNumber { get; init; }
    public DateOnly RequisitionDate { get; set; }
    public Guid VanDriverId { get; set; }
    public string VanDriverName { get; set; } = string.Empty;
    public string TradersName { get; set; } = string.Empty;
    public string VanDriverCode { get; set; } = string.Empty;
    public Guid ShopId { get; set; }
    public string ShopCode { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public bool IsVatApplicable { get; set; }
    
    public decimal Subtotal { get; private set; }
    public RequisitionStatus Status { get; private set; }
    
    public Guid? SubmittedById { get; private set; }
    public string? SubmittedByNameSnapshot { get; private set; }
    public DateTime? SubmittedAtUtc { get; private set; }
    
    public Guid? ApprovedById { get; private set; }
    public DateTime? ApprovedAtUtc { get; private set; }
    public string? ApprovedByNameSnapshot { get; private set; }
    public string? PoNumber { get; set; }
    
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
    
    public int NextSubmissionNumber => _submissions.Count + 1;
    
    public bool CanSubmit => Status is RequisitionStatus.Draft or RequisitionStatus.Rejected;
    
    public static FeRequisition Create(string requisitionNumber, RequisitionDetails details, IEnumerable<FeGeneralTaskUpdateModel> taskModels)
    {
        var requisition = new FeRequisition
        {
            RequisitionNumber = requisitionNumber,
            Status = RequisitionStatus.Draft
        };

        requisition.UpdateDetails(details);
        requisition.SyncGeneralTasks(taskModels);
        
        return requisition;
    }
    
    public void UpdateDetails(RequisitionDetails details)
    {
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
                var task = new FeGeneralTask(
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
    
    public void Submit(Guid submittedById, string submittedByName, DateTime submittedAtUtc)
    {
        if (!CanSubmit) throw new InvalidOperationException("Only draft or rejected requisitions can be submitted.");

        Status = RequisitionStatus.Submitted;
        SubmittedById = submittedById;
        SubmittedByNameSnapshot = submittedByName;
        SubmittedAtUtc = submittedAtUtc;
        RejectedById = null;
        RejectedAtUtc = null;
        RejectedByNameSnapshot = null;
        RejectionNotes = null;
    }
    
    public void AddSubmission(FeRequisitionSubmission submission)
    {
        ArgumentNullException.ThrowIfNull(submission);
        _submissions.Add(submission);
    }
    
    public void Approve(Guid approvedById, string approvedByName, DateTime approvedAtUtc)
    {
        if (Status != RequisitionStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requisitions can be approved.");
        }

        Status = RequisitionStatus.Approved;
        ApprovedById = approvedById;
        ApprovedByNameSnapshot = approvedByName;
        ApprovedAtUtc = approvedAtUtc;
        
        RejectedById = null;
        RejectedByNameSnapshot = null;
        RejectedAtUtc = null;
        RejectionNotes = null;
    }
    
    public void Reject(Guid rejectedById, string rejectedByName, string rejectionNotes, DateTime rejectedAtUtc)
    {
        if (Status != RequisitionStatus.Submitted)
        {
            throw new InvalidOperationException("Only submitted requisitions can be rejected.");
        }

        Status = RequisitionStatus.Rejected;
        RejectedById = rejectedById;
        RejectedByNameSnapshot = rejectedByName;
        RejectedAtUtc = rejectedAtUtc;
        RejectionNotes = rejectionNotes;
    }

    private void RecalculateSubtotal()
    {
        Subtotal = CalculateSubtotal();
    }

    private decimal CalculateSubtotal()
    {
        var generalTasksTotal = FeGeneralTasks.Sum(x => x.TotalValue ?? 0);
        var mileageTotal = FeMileages.Sum(x => x.TotalValue ?? 0);
        var transfersTotal = FeTransfers.Sum(x => x.TotalValue ?? 0);
        var additionalCostsTotal = FeAdditionalCosts.Sum(x => x.TotalValue ?? 0);

        return generalTasksTotal + mileageTotal + transfersTotal + additionalCostsTotal;
    }
}