namespace VanDriverRequisitions.Application.Common.Models;

public sealed record LoggedInUser(Guid Id, string Name)
{
    public static LoggedInUser System => new(Guid.Empty, "System");
};