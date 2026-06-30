using VanDriverRequisitions.Application.Exceptions;

namespace VanDriverRequisitions.Application.Common.Requisitions;

public static class InactiveLookupGuard
{
    public static void EnsureActiveForNewRequisition(bool isActive, string lookupDescription)
    {
        if (!isActive)
        {
            throw new BadRequestException($"{lookupDescription} is inactive and cannot be used for a new requisition.");
        }
    }
    
    public static void EnsureActiveOrUnchangedForExistingLookup(Guid existingLookupId, Guid incomingLookupId, bool incomingLookupIsActive, string lookupDescription)
    {
        if (incomingLookupIsActive)
        {
            return;
        }

        if (existingLookupId == incomingLookupId)
        {
            return;
        }

        throw new BadRequestException($"{lookupDescription} is inactive and cannot be selected.");
    }
    
    public static void EnsureActiveOrUnchangedForExistingChildLookup(Guid? incomingRowId, Guid incomingLookupId, bool incomingLookupIsActive, IReadOnlyDictionary<Guid, Guid> existingLookupIdByRowId, string lookupDescription)
    {
        if (incomingLookupIsActive)
        {
            return;
        }

        if (incomingRowId.HasValue && existingLookupIdByRowId.TryGetValue(incomingRowId.Value, out var existingLookupId) && existingLookupId == incomingLookupId)
        {
            return;
        }

        throw new BadRequestException($"{lookupDescription} is inactive and cannot be selected.");
    }
}