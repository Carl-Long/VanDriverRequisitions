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
}