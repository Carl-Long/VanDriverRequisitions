namespace VanDriverRequisitions.Application.Common.Models;

public sealed record LoggedInUser(
    Guid Id,
    string Name
);