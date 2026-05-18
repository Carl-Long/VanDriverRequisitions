namespace VanDriverRequisitions.Api.Auth.Dev;

public static class DevUserStore
{
    private static readonly Dictionary<string, DevUser> Users = new()
    {
        ["user@test.com"] = new DevUser(
            Guid.Parse("3f2c1a6e-9d3b-4c8f-8c2e-1a7d5b9f4e21"),
            "Test User",
            "user@test.com",
            "User"
        ),

        ["admin@test.com"] = new DevUser(
            Guid.Parse("8a91d4b2-6f3e-4a10-9c6d-2f5e7b1c9d88"),
            "Admin User",
            "admin@test.com",
            "Admin"
        )
    };
    
    public static DevUser? Get(string email)
        => Users.GetValueOrDefault(email);
}

public record DevUser(
    Guid Oid,
    string DisplayName,
    string UserPrincipalName,
    string Role
);