using VanDriverRequisitions.Application.Common.Models;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface ICurrentUserService
{
    LoggedInUser? TryGetUser();
    LoggedInUser RequireUser();
    LoggedInUser UserOrSystem { get; }
}