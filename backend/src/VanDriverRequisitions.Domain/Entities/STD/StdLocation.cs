using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Domain.Entities.STD;

public class StdLocation : LookupEntity
{
    private StdLocation() { } // EF

    public Guid CollectionTypeId { get; private set; }
    public StdCollectionType CollectionType { get; private set; } = null!;

    public Guid ShopId { get; private set; }
    public Shop Shop { get; private set; } = null!;

    public string LocationName { get; private set; } = string.Empty;
    public string PostCode { get; private set; } = string.Empty;

    public static StdLocation Create(Guid shopId, Guid collectionTypeId, string locationName, string postCode)
    {
        var location = new StdLocation
        {
            IsActive = true
        };

        location.UpdateDetails(shopId, collectionTypeId, locationName, postCode);

        return location;
    }

    public void UpdateDetails(Guid shopId, Guid collectionTypeId, string locationName, string postCode)
    {
        if (shopId == Guid.Empty)
        {
            throw new ArgumentException("Shop is required.", nameof(shopId));
        }

        if (collectionTypeId == Guid.Empty)
        {
            throw new ArgumentException("Collection type is required.", nameof(collectionTypeId));
        }

        if (string.IsNullOrWhiteSpace(locationName))
        {
            throw new ArgumentNullException(nameof(locationName), "Location name is required.");
        }

        if (string.IsNullOrWhiteSpace(postCode))
        {
            throw new ArgumentNullException(nameof(postCode), "Postcode is required.");
        }

        ShopId = shopId;
        CollectionTypeId = collectionTypeId;
        LocationName = locationName.Trim();
        PostCode = NormalisePostCode(postCode);
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    private static string NormalisePostCode(string value)
    {
        return value.Trim().ToUpperInvariant();
    }
}