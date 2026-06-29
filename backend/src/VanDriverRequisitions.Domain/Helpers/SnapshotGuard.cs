using VanDriverRequisitions.Domain.Entities.Common.Models;

namespace VanDriverRequisitions.Domain.Helpers;

public static class SnapshotGuard
{
    public static VanDriverSnapshot EnsureRequiredVanDriver(VanDriverSnapshot snapshot, string label)
    {
        ArgumentNullException.ThrowIfNull(snapshot, label);

        EnsureRequiredId(snapshot.Id, $"{label} id");

        return snapshot with
        {
            Code = EnsureRequiredText(snapshot.Code, $"{label} code"),
            Name = EnsureRequiredText(snapshot.Name, $"{label} name"),
            TradersName = EnsureRequiredText(snapshot.TradersName, $"{label} trader's name")
        };
    }

    public static ShopSnapshot EnsureRequiredShop(ShopSnapshot snapshot, string label)
    {
        ArgumentNullException.ThrowIfNull(snapshot, label);

        EnsureRequiredId(snapshot.Id, $"{label} id");

        return snapshot with
        {
            Code = EnsureRequiredText(snapshot.Code, $"{label} code"),
            Name = EnsureRequiredText(snapshot.Name, $"{label} name")
        };
    }

    public static Guid EnsureRequiredId(Guid value, string label)
    {
        if (value == Guid.Empty)
        {
            throw new InvalidOperationException($"{label} is required.");
        }

        return value;
    }

    public static string EnsureRequiredText(string? value, string label)
    {
        if (value is null)
        {
            throw new ArgumentNullException(label);
        }

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException($"{label} is required.", label);
        }

        return value.Trim();
    }
}