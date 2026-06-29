using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Domain.Helpers;

public static class ChildCollectionSyncHelper
{
    public static void Sync<TChild, TIncoming>(
        List<TChild> children,
        IEnumerable<TIncoming> incomingItems,
        Func<TIncoming, Guid?> getId,
        Action<TChild, TIncoming> updateExisting,
        Func<TIncoming, TChild> createNew,
        string childName)
        where TChild : AuditableEntity
    {
        ArgumentNullException.ThrowIfNull(children);
        ArgumentNullException.ThrowIfNull(incomingItems);

        var incomingList = incomingItems.ToList();
        var existingChildren = GetPersistedChildrenById(children);

        EnsureNoDuplicateIncomingIds(incomingList, getId, childName);
        EnsureIncomingIdsBelongToExistingChildren(incomingList, getId, existingChildren, childName);

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
                var existing = existingChildren[id!.Value];
                updateExisting(existing, incoming);
            }
            else
            {
                children.Add(createNew(incoming));
            }
        }
    }

    private static Dictionary<Guid, TChild> GetPersistedChildrenById<TChild>(
        IEnumerable<TChild> children)
        where TChild : AuditableEntity
    {
        return children
            .Where(x => x.Id != Guid.Empty)
            .ToDictionary(x => x.Id);
    }

    private static HashSet<Guid> GetIncomingIds<TIncoming>(
        IEnumerable<TIncoming> incomingItems,
        Func<TIncoming, Guid?> getId)
    {
        return incomingItems
            .Select(getId)
            .Where(IsExistingChild)
            .Select(id => id!.Value)
            .ToHashSet();
    }

    private static void EnsureNoDuplicateIncomingIds<TIncoming>(
        IEnumerable<TIncoming> incomingItems,
        Func<TIncoming, Guid?> getId,
        string childName)
    {
        var duplicateId = incomingItems
            .Select(getId)
            .Where(IsExistingChild)
            .Select(id => id!.Value)
            .GroupBy(id => id)
            .Where(group => group.Count() > 1)
            .Select(group => group.Key)
            .FirstOrDefault();

        if (duplicateId == Guid.Empty)
        {
            return;
        }

        throw new InvalidOperationException(
            $"{childName} '{duplicateId}' is duplicated in the incoming update.");
    }

    private static void EnsureIncomingIdsBelongToExistingChildren<TChild, TIncoming>(
        IEnumerable<TIncoming> incomingItems,
        Func<TIncoming, Guid?> getId,
        IReadOnlyDictionary<Guid, TChild> existingChildren,
        string childName)
    {
        var unknownId = incomingItems
            .Select(getId)
            .Where(IsExistingChild)
            .Select(id => id!.Value)
            .FirstOrDefault(id => !existingChildren.ContainsKey(id));

        if (unknownId == Guid.Empty)
        {
            return;
        }

        throw new InvalidOperationException($"{childName} '{unknownId}' not found.");
    }

    private static bool IsExistingChild(Guid? id)
    {
        return id.HasValue && id.Value != Guid.Empty;
    }
}