namespace VanDriverRequisitions.Api.Auth.Dev;

public static class DevUserStore
{
    private static readonly Dictionary<string, DevUser> Users = new()
    {
        ["user@test.com"] = new DevUser(
            Guid.Parse("3f2c1a6e-9d3b-4c8f-8c2e-1a7d5b9f4e21"),
            "Test User",
            "user@test.com",
            ["User"]
        ),

        ["admin@test.com"] = new DevUser(
            Guid.Parse("8a91d4b2-6f3e-4a10-9c6d-2f5e7b1c9d88"),
            "Admin User",
            "admin@test.com",
            ["Admin"]
        ),

        ["approver@test.com"] = new DevUser(
            Guid.Parse("2b7a6f4d-06d5-4f83-bd58-8ac663a2bb61"),
            "Approver User",
            "approver@test.com",
            ["Approver"]
        ),

        ["superuser@test.com"] = new DevUser(
            Guid.Parse("7f3c9f2a-5d8e-4a71-9c42-6be1d94e8f17"),
            "Carl Long",
            "superuser@test.com",
            ["Admin", "User", "Approver"]
        )
    };

    public static DevUser? Get(string email)
        => Users.GetValueOrDefault(email);
}

public record DevUser(
    Guid Oid,
    string DisplayName,
    string UserPrincipalName,
    string[] Roles
);