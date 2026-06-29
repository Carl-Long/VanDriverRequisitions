using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.Shops.Dtos;
using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.UnitTests.TestData;

public static class RequisitionBuilderTestData
{
    public static VanDriverLookupDto CreateDriverLookup(Guid id, bool isActive = true)
    {
        return new VanDriverLookupDto
        {
            Id = id,
            Code = "VD001",
            TradersName = "Test Driver Trading",
            Address1 = "1 Test Street",
            Postcode = "AB1 2CD",
            HasVat = true,
            IsActive = isActive
        };
    }

    public static ShopRequisitionSnapshotDto CreateShopSnapshot(
        Guid id,
        string code = "S001",
        string name = "Test Shop",
        bool isActive = true)
    {
        return new ShopRequisitionSnapshotDto
        {
            Id = id,
            Code = code,
            Name = name,
            IsActive = isActive
        };
    }

    public static WeeklyQuantitiesDto CreateWeek()
    {
        return new WeeklyQuantitiesDto { Monday = 1, Tuesday = 2, Wednesday = 3 };
    }

    public static FeTaskType CreateFeTaskType(
        Guid id,
        bool isActive = true,
        string code = "23707",
        string name = "General Task")
    {
        return new FeTaskType { Id = id, Code = code, Name = name, IsActive = isActive };
    }

    public static CostReason CreateCostReason(
        Guid id,
        CostReasonScope scope,
        bool isActive = true,
        string code = "10001",
        string reason = "Parking")
    {
        return new CostReason { Id = id, Code = code, Reason = reason, Scope = scope, IsActive = isActive };
    }

    public static StdCollectionType CreateStdCollectionType(
        Guid id,
        bool isActive = true,
        string code = "2389",
        string name = "Banks & Bins")
    {
        return new StdCollectionType { Id = id, Code = code, Name = name, IsActive = isActive };
    }

    public static StdLocation CreateStdLocation(
        Guid id,
        Guid shopId,
        Guid collectionTypeId,
        bool isActive = true,
        string locationName = "Test Location",
        string postCode = "AB1 2CD")
    {
        var location = StdLocation.Create(shopId, collectionTypeId, locationName, postCode);

        location.Id = id;

        if (!isActive)
        {
            location.Deactivate();
        }

        return location;
    }
}