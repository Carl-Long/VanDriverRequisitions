namespace VanDriverRequisitions.Domain.ValueObjects;

public sealed record AuditUser
{
    public Guid Id { get; }
    public string NameSnapshot { get; }

    public AuditUser(Guid id, string nameSnapshot)
    {
        if (id == Guid.Empty) throw new ArgumentException("User id is required.", nameof(id));

        ArgumentException.ThrowIfNullOrWhiteSpace(nameSnapshot);

        Id = id;
        NameSnapshot = nameSnapshot;
    }
}