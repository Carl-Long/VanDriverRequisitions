namespace VanDriverRequisitions.Domain.Interfaces;

public interface ISoftDeletable
{
    DateTime? DeletedAtUtc { get; set; }
    Guid? DeletedById { get; set; }
    string? DeletedByNameSnapshot { get; set; }
}
