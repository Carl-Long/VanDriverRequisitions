using VanDriverRequisitions.Domain.Entities.Base;

namespace VanDriverRequisitions.Domain.UnitTests.TestData;

public static class PersistedEntityTestHelper
{
    public static Guid MarkAsPersisted(BaseEntity entity)
    {
        return MarkAsPersisted(entity, Guid.NewGuid());
    }

    public static Guid MarkAsPersisted(BaseEntity entity, Guid id)
    {
        ArgumentNullException.ThrowIfNull(entity);

        if (id == Guid.Empty)
        {
            throw new ArgumentException("Persisted entity id cannot be empty.", nameof(id));
        }

        entity.Id = id;

        return id;
    }
}