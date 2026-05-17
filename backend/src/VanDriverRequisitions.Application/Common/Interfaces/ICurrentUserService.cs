using VanDriverRequisitions.Application.Common.Models;

namespace VanDriverRequisitions.Application.Common.Interfaces;

public interface ICurrentUserService
{
    LoggedInUser User { get; }
}