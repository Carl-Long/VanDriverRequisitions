using VanDriverRequisitions.Domain.Entities.FE;
using static VanDriverRequisitions.Domain.UnitTests.TestData.WeeklyQuantitiesTestData;

namespace VanDriverRequisitions.Domain.UnitTests.Entities.FE;

public sealed class FeGeneralTaskTests
{
    private static readonly DateOnly WeekEndingDate = new(2026, 6, 13);

    [Fact]
    public void Create_WhenValid_SetsTaskTypeAndCalculatesTotalNumberAndTotalValue()
    {
        // Arrange
        var taskTypeId = Guid.NewGuid();
        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var task = FeGeneralTask.Create(
            taskTypeId,
            taskTypeName: "Collections",
            taskTypeCode: "23707",
            WeekEndingDate,
            week,
            ratePerJob: 2m);

        // Assert
        Assert.Equal(taskTypeId, task.FeTaskTypeId);
        Assert.Equal("Collections", task.TaskTypeName);
        Assert.Equal("23707", task.TaskTypeCode);

        Assert.Equal(WeekEndingDate, task.WeekEndingDate);
        Assert.Same(week, task.Week);
        Assert.Equal(28, task.TotalNumber);
        Assert.Equal(2m, task.RatePerJob);
        Assert.Equal(56.00m, task.TotalValue);
    }

    [Fact]
    public void Create_WhenRateIsNull_CalculatesTotalNumberAndZeroTotalValue()
    {
        // Arrange
        var week = CreateWeek(1, 2, 3, 4, 5, 6, 7);

        // Act
        var task = FeGeneralTask.Create(
            Guid.NewGuid(),
            taskTypeName: "Collections",
            taskTypeCode: "23707",
            WeekEndingDate,
            week,
            ratePerJob: null);

        // Assert
        Assert.Equal(28, task.TotalNumber);
        Assert.Null(task.RatePerJob);
        Assert.Equal(0m, task.TotalValue);
    }

    [Fact]
    public void Create_WhenWeekHasNullValues_TreatsNullValuesAsZero()
    {
        // Arrange
        var week = CreateWeek(
            sunday: null,
            monday: 2,
            tuesday: null,
            wednesday: 4,
            thursday: null,
            friday: 6,
            saturday: null);

        // Act
        var task = FeGeneralTask.Create(
            Guid.NewGuid(),
            taskTypeName: "Collections",
            taskTypeCode: "23707",
            WeekEndingDate,
            week,
            ratePerJob: 3m);

        // Assert
        Assert.Equal(12, task.TotalNumber);
        Assert.Equal(36.00m, task.TotalValue);
    }

    [Fact]
    public void Update_WhenValid_UpdatesWeekEndingDateWeekRateAndRecalculatesTotals()
    {
        // Arrange
        var task = CreateTask();

        var newWeekEndingDate = new DateOnly(2026, 6, 20);
        var newWeek = CreateWeek(10, 20, 30, 40, 50, 60, 70);

        // Act
        task.Update(newWeekEndingDate, newWeek, ratePerJob: 0.25m);

        // Assert
        Assert.Equal(newWeekEndingDate, task.WeekEndingDate);
        Assert.Same(newWeek, task.Week);
        Assert.Equal(280, task.TotalNumber);
        Assert.Equal(0.25m, task.RatePerJob);
        Assert.Equal(70.00m, task.TotalValue);

        Assert.Equal("Collections", task.TaskTypeName);
        Assert.Equal("23707", task.TaskTypeCode);
    }

    [Fact]
    public void Create_WhenTaskTypeIdIsEmpty_ThrowsArgumentException()
    {
        // Act
        var exception = Assert.Throws<ArgumentException>(() =>
            FeGeneralTask.Create(
                Guid.Empty,
                taskTypeName: "Collections",
                taskTypeCode: "23707",
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));

        // Assert
        Assert.Equal("feTaskTypeId", exception.ParamName);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenTaskTypeNameIsMissing_ThrowsArgumentException(string? taskTypeName)
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            FeGeneralTask.Create(
                Guid.NewGuid(),
                taskTypeName!,
                taskTypeCode: "23707",
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenTaskTypeCodeIsMissing_ThrowsArgumentException(string? taskTypeCode)
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            FeGeneralTask.Create(
                Guid.NewGuid(),
                taskTypeName: "Collections",
                taskTypeCode!,
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: 1m));
    }

    [Fact]
    public void Create_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            FeGeneralTask.Create(
                Guid.NewGuid(),
                taskTypeName: "Collections",
                taskTypeCode: "23707",
                WeekEndingDate,
                null!,
                ratePerJob: 1m));

        // Assert
        Assert.Equal("week", exception.ParamName);
    }

    [Fact]
    public void Update_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var task = CreateTask();

        // Act
        var exception = Assert.Throws<ArgumentNullException>(() =>
            task.Update(
                new DateOnly(2026, 6, 20),
                null!,
                ratePerJob: 1m));

        // Assert
        Assert.Equal("week", exception.ParamName);
    }

    [Fact]
    public void Create_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeGeneralTask.Create(
                Guid.NewGuid(),
                taskTypeName: "Collections",
                taskTypeCode: "23707",
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: -0.01m));
    }

    [Fact]
    public void Update_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var task = CreateTask();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            task.Update(
                new DateOnly(2026, 6, 20),
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob: -0.01m));
    }
    
    [Theory]
    [InlineData(0)]
    [InlineData(0.001)]
    public void Create_WhenRateIsBelowMinimum_ThrowsInvalidOperationException(decimal ratePerJob)
    {
        Assert.Throws<InvalidOperationException>(() =>
            FeGeneralTask.Create(
                Guid.NewGuid(),
                taskTypeName: "Collections",
                taskTypeCode: "23707",
                WeekEndingDate,
                CreateWeek(1, 1, 1, 1, 1, 1, 1),
                ratePerJob));
    }

    private static FeGeneralTask CreateTask()
    {
        return FeGeneralTask.Create(
            Guid.NewGuid(),
            taskTypeName: "Collections",
            taskTypeCode: "23707",
            WeekEndingDate,
            CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob: 1m);
    }

   
}