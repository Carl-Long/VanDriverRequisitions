using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;

namespace VanDriverRequisitions.Infrastructure.Identity;

public sealed class SystemCurrentUserService : ICurrentUserService
{
    public LoggedInUser? TryGetUser() => LoggedInUser.System;
    public LoggedInUser User => LoggedInUser.System;
}