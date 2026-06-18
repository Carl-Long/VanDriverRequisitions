using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.UnitTests.TestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.STD;

public sealed class StdCollectionVanPackTests
{
    [Fact]
    public void Create_WhenValid_CalculatesTotalValueUnusedVanPacksAndPercentReturned()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionVanPackModel(vanPacksOut: 10, filledBags: 4, ratePerVanPack: 2.50m);
        // Act
        var vanPack = StdCollectionVanPack.Create(model);

        // Assert
        Assert.Equal(model.DeliveryDate, vanPack.DeliveryDate);
        Assert.Equal("AB", vanPack.PostCodeZone);
        Assert.Equal(10, vanPack.VanPacksOut);
        Assert.Equal(4, vanPack.FilledBags);
        Assert.Equal(2.50m, vanPack.RatePerVanPack);

        Assert.Equal(6, vanPack.UnusedVanPacks);
        Assert.Equal(40.00m, vanPack.PercentReturned);
        Assert.Equal(25.00m, vanPack.TotalValue);
    }

    [Fact]
    public void Update_WhenValid_UpdatesValuesAndRecalculatesDerivedValues()
    {
        // Arrange
        var vanPack = StdCollectionVanPack.Create(
            StdRequisitionTestData.CreateCollectionVanPackModel(
                vanPacksOut: 5,
                filledBags: 2,
                ratePerVanPack: 2m));

        var updateModel = StdRequisitionTestData.CreateCollectionVanPackModel(
            postCodeZone: "CD",
            vanPacksOut: 8,
            filledBags: 6,
            ratePerVanPack: 1.50m);

        // Act
        vanPack.Update(updateModel);

        // Assert
        Assert.Equal("CD", vanPack.PostCodeZone);
        Assert.Equal(8, vanPack.VanPacksOut);
        Assert.Equal(6, vanPack.FilledBags);
        Assert.Equal(2, vanPack.UnusedVanPacks);
        Assert.Equal(75.00m, vanPack.PercentReturned);
        Assert.Equal(12.00m, vanPack.TotalValue);
    }

    [Fact]
    public void Create_WhenFilledBagsExceedsVanPacksOut_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionVanPackModel(vanPacksOut: 3, filledBags: 4);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdCollectionVanPack.Create(model));
    }

    [Fact]
    public void Create_WhenPostCodeZoneHasWhitespace_TrimsPostCodeZone()
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionVanPackModel(postCodeZone: "  AB  ");

        // Act
        var vanPack = StdCollectionVanPack.Create(model);

        // Assert
        Assert.Equal("AB", vanPack.PostCodeZone);
    }

    [Theory]
    [InlineData(-1, 0, 1)]
    [InlineData(1, -1, 1)]
    [InlineData(1, 0.2, -0.01)]
    public void Create_WhenNumericValuesLessThanOne_ThrowsInvalidOperationException(int vanPacksOut, int filledBags, decimal ratePerVanPack)
    {
        // Arrange
        var model = StdRequisitionTestData.CreateCollectionVanPackModel(vanPacksOut: vanPacksOut, filledBags: filledBags, ratePerVanPack: ratePerVanPack);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => StdCollectionVanPack.Create(model));
    }
}