using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdCollectionChargeBanksAndBinsTests
{
    [Fact]
    public void Create_WhenMileageBased_SetsSnapshotsAndCalculatesTotalValue()
    {
        // Arrange
        var collectionTypeId = Guid.NewGuid();
        var locationId = Guid.NewGuid();

        var model = StdRequisitionTestData.CreateCollectionChargeMileageModel(
            collectionTypeId: collectionTypeId,
            locationId: locationId,
            locationCollectionTypeId: collectionTypeId,
            miles: 20,
            ratePerMile: 0.45m);

        // Act
        var charge = StdCollectionChargeBanksAndBins.Create(model);

        // Assert
        Assert.Equal(model.Date, charge.Date);

        Assert.Equal(collectionTypeId, charge.CollectionTypeId);
        Assert.Equal("Banks", charge.CollectionTypeNameSnapshot);
        Assert.Equal("BANK", charge.CollectionTypeCodeSnapshot);

        Assert.Equal(locationId, charge.LocationId);
        Assert.Equal("Bank Location A", charge.LocationNameSnapshot);
        Assert.Equal("AB1 2CD", charge.LocationPostCodeSnapshot);

        Assert.Equal(StdChargeType.Mileage, charge.ChargeType);
        Assert.Equal(20, charge.Miles);
        Assert.Equal(0.45m, charge.RatePerMile);
        Assert.Equal(9.00m, charge.TotalValue);

        Assert.Null(charge.FlatCharge);
    }

    [Fact]
    public void Create_WhenFlatChargeBased_CalculatesTotalValueAndClearsMileageFields()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionChargeFlatChargeModel(flatCharge: 9m);

        // Act
        var charge = StdCollectionChargeBanksAndBins.Create(model);

        // Assert
        Assert.Equal(StdChargeType.FlatCharge, charge.ChargeType);
        Assert.Equal(9m, charge.FlatCharge);
        Assert.Equal(9m, charge.TotalValue);

        Assert.Null(charge.Miles);
        Assert.Null(charge.RatePerMile);
    }

    [Fact]
    public void Create_WhenLocationDoesNotBelongToCollectionType_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionChargeMileageModel(
            collectionTypeId: Guid.NewGuid(),
            locationCollectionTypeId: Guid.NewGuid());

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdCollectionChargeBanksAndBins.Create(model));
    }

    [Fact]
    public void Create_WhenLocationIdIsEmpty_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionChargeMileageModel(locationId: Guid.Empty);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdCollectionChargeBanksAndBins.Create(model));
    }

    [Fact]
    public void Create_WhenNumberOfBagsIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionChargeMileageModel(numberOfBags: -1);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdCollectionChargeBanksAndBins.Create(model));
    }
}