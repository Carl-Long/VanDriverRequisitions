using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.STD.Models;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Domain.Entities.STD;

public sealed class StdRequisition : ConcurrencyAwareEntity
{
    private StdRequisition() { } // EF Core

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

    private readonly List<StdPickup> _pickups = [];
    private readonly List<StdTransfer> _transfers = [];
    private readonly List<StdCollectionChargeBanksAndBins> _collectionChargesBanksAndBins = [];
    private readonly List<StdCollectionVanPack> _collectionVanPacks = [];
    private readonly List<StdAdditionalCost> _additionalCosts = [];
    private readonly List<StdRequisitionSubmission> _submissions = [];

    public IReadOnlyCollection<StdPickup> Pickups => _pickups;
    public IReadOnlyCollection<StdTransfer> Transfers => _transfers;
    public IReadOnlyCollection<StdCollectionChargeBanksAndBins> CollectionChargesBanksAndBins => _collectionChargesBanksAndBins;
    public IReadOnlyCollection<StdCollectionVanPack> CollectionVanPacks => _collectionVanPacks;
    public IReadOnlyCollection<StdAdditionalCost> AdditionalCosts => _additionalCosts;
    public IReadOnlyCollection<StdRequisitionSubmission> Submissions => _submissions;

    public StdRequisitionSubmission? LatestSubmission => _submissions
        .OrderByDescending(x => x.SubmissionNumber)
        .FirstOrDefault();

    public StdRequisitionSubmission? PendingSubmission => _submissions
        .SingleOrDefault(x => x.Status == SubmissionStatus.Pending);

    public int NextSubmissionNumber => _submissions.Count == 0
        ? 1
        : _submissions.Max(x => x.SubmissionNumber) + 1;

    public bool CanSubmit => Status is RequisitionStatus.Draft or RequisitionStatus.Rejected;
    public bool CanEdit => Status is RequisitionStatus.Draft or RequisitionStatus.Rejected;

    public static StdRequisition Create(string requisitionNumber, StdRequisitionUpdateModel model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(requisitionNumber);
        ArgumentNullException.ThrowIfNull(model);

        var requisition = new StdRequisition
        {
            RequisitionNumber = requisitionNumber,
            Status = RequisitionStatus.Draft
        };

        requisition.Update(model);

        return requisition;
    }

    public void Update(StdRequisitionUpdateModel model)
    {
        ArgumentNullException.ThrowIfNull(model);

        if (!CanEdit)
        {
            throw new InvalidOperationException("Only draft or rejected requisitions can be edited.");
        }

        UpdateDetails(model.Details);

        SyncPickups(model.Pickups);
        SyncTransfers(model.Transfers);
        SyncCollectionChargesBanksAndBins(model.CollectionChargesBanksAndBins);
        SyncCollectionVanPacks(model.CollectionVanPacks);
        SyncAdditionalCosts(model.AdditionalCosts);

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

        var submission = StdRequisitionSubmission.Create(NextSubmissionNumber, submittedBy, submittedAtUtc, snapshotJson);

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

    private void UpdateDetails(StdRequisitionDetails details)
    {
        ArgumentNullException.ThrowIfNull(details);
        ArgumentNullException.ThrowIfNull(details.Driver);
        ArgumentNullException.ThrowIfNull(details.Shop);

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

    private void SyncPickups(IEnumerable<StdPickupUpdateModel> incomingPickups)
    {
        SyncChildren(
            _pickups,
            incomingPickups,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            StdPickup.Create,
            "Pickup");
    }

    private void SyncTransfers(IEnumerable<StdTransferUpdateModel> incomingTransfers)
    {
        SyncChildren(
            _transfers,
            incomingTransfers,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            StdTransfer.Create,
            "Transfer");
    }

    private void SyncCollectionChargesBanksAndBins(
        IEnumerable<StdCollectionChargeBanksAndBinsUpdateModel> incomingCollectionCharges)
    {
        SyncChildren(
            _collectionChargesBanksAndBins,
            incomingCollectionCharges,
            x => x.Id,
            (existing, incoming) =>
            {
                EnsureLocationBelongsToSelectedShop(incoming);
                existing.Update(incoming);
            },
            incoming =>
            {
                EnsureLocationBelongsToSelectedShop(incoming);
                return StdCollectionChargeBanksAndBins.Create(incoming);
            },
            "Collection charge");
    }

    private void SyncCollectionVanPacks(IEnumerable<StdCollectionVanPackUpdateModel> incomingVanPacks)
    {
        SyncChildren(
            _collectionVanPacks,
            incomingVanPacks,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            StdCollectionVanPack.Create,
            "Collection van pack");
    }

    private void SyncAdditionalCosts(IEnumerable<StdAdditionalCostUpdateModel> incomingAdditionalCosts)
    {
        SyncChildren(
            _additionalCosts,
            incomingAdditionalCosts,
            x => x.Id,
            (existing, incoming) => existing.Update(incoming),
            StdAdditionalCost.Create,
            "Additional cost");
    }

    private void EnsureLocationBelongsToSelectedShop(
        StdCollectionChargeBanksAndBinsUpdateModel incoming)
    {
        if (incoming.LocationShopId != ShopId)
        {
            throw new InvalidOperationException("Location does not belong to the selected requisition shop.");
        }
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
        var pickupTotal = _pickups.Sum(x => x.TotalValue ?? 0);
        var transferTotal = _transfers.Sum(x => x.TotalValue ?? 0);
        var collectionChargeTotal = _collectionChargesBanksAndBins.Sum(x => x.TotalValue ?? 0);
        var collectionVanPackTotal = _collectionVanPacks.Sum(x => x.TotalValue ?? 0);
        var additionalCostTotal = _additionalCosts.Sum(x => x.TotalValue ?? 0);

        return pickupTotal + transferTotal + collectionChargeTotal + collectionVanPackTotal + additionalCostTotal;
    }
}