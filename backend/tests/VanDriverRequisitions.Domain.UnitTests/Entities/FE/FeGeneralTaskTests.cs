using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Entities.FE.Models;
using VanDriverRequisitions.Domain.ValueObjects;
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
        var task = FeGeneralTask.Create(CreateModel(
            feTaskTypeId: taskTypeId,
            taskTypeName: "Collections",
            taskTypeCode: "23707",
            week: week,
            ratePerJob: 2m));

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
        var task = FeGeneralTask.Create(CreateModel(
            week: week,
            ratePerJob: null));

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
        var task = FeGeneralTask.Create(CreateModel(
            week: week,
            ratePerJob: 3m));

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
        task.Update(CreateModel(
            weekEndingDate: newWeekEndingDate,
            week: newWeek,
            ratePerJob: 0.25m));

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
        // Act / Assert
        Assert.Throws<ArgumentException>(() =>
            FeGeneralTask.Create(CreateModel(feTaskTypeId: Guid.Empty)));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenTaskTypeNameIsMissing_ThrowsArgumentException(string? taskTypeName)
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            FeGeneralTask.Create(CreateModel(taskTypeName: taskTypeName!)));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WhenTaskTypeCodeIsMissing_ThrowsArgumentException(string? taskTypeCode)
    {
        // Act / Assert
        Assert.ThrowsAny<ArgumentException>(() =>
            FeGeneralTask.Create(CreateModel(taskTypeCode: taskTypeCode!)));
    }

    [Fact]
    public void Create_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var model = new FeGeneralTaskUpdateModel(
            Id: null,
            FeTaskTypeId: Guid.NewGuid(),
            TaskTypeName: "Collections",
            TaskTypeCode: "23707",
            WeekEndingDate,
            Week: null!,
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => FeGeneralTask.Create(model));
    }

    [Fact]
    public void Update_WhenWeekIsNull_ThrowsArgumentNullException()
    {
        // Arrange
        var task = CreateTask();

        var model = new FeGeneralTaskUpdateModel(
            Id: null,
            FeTaskTypeId: Guid.NewGuid(),
            TaskTypeName: "Collections",
            TaskTypeCode: "23707",
            new DateOnly(2026, 6, 20),
            Week: null!,
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<ArgumentNullException>(() => task.Update(model));
    }

    [Fact]
    public void Create_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeGeneralTask.Create(CreateModel(ratePerJob: -0.01m)));
    }

    [Fact]
    public void Update_WhenRateIsNegative_ThrowsInvalidOperationException()
    {
        // Arrange
        var task = CreateTask();

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            task.Update(CreateModel(
                weekEndingDate: new DateOnly(2026, 6, 20),
                ratePerJob: -0.01m)));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(0.001)]
    public void Create_WhenRateIsBelowMinimum_ThrowsInvalidOperationException(decimal ratePerJob)
    {
        // Act / Assert
        Assert.Throws<InvalidOperationException>(() =>
            FeGeneralTask.Create(CreateModel(ratePerJob: ratePerJob)));
    }
    
    [Fact]
    public void Create_WhenWeekEndingDateIsDefault_ThrowsInvalidOperationException()
    {
        // Arrange
        var model = new FeGeneralTaskUpdateModel(
            Id: null,
            FeTaskTypeId: Guid.NewGuid(),
            TaskTypeName: "Collections",
            TaskTypeCode: "23707",
            WeekEndingDate: default(DateOnly),
            Week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
            RatePerJob: 1m);

        // Act / Assert
        Assert.Throws<InvalidOperationException>(() => FeGeneralTask.Create(model));
    }

    private static FeGeneralTask CreateTask()
    {
        return FeGeneralTask.Create(CreateModel(
            taskTypeName: "Collections",
            taskTypeCode: "23707",
            week: CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob: 1m));
    }

    private static FeGeneralTaskUpdateModel CreateModel(
        Guid? id = null,
        Guid? feTaskTypeId = null,
        string taskTypeName = "Collections",
        string taskTypeCode = "23707",
        DateOnly? weekEndingDate = null,
        WeeklyQuantities? week = null,
        decimal? ratePerJob = 1m)
    {
        return new FeGeneralTaskUpdateModel(
            id,
            feTaskTypeId ?? Guid.NewGuid(),
            taskTypeName,
            taskTypeCode,
            weekEndingDate ?? WeekEndingDate,
            week ?? CreateWeek(1, 1, 1, 1, 1, 1, 1),
            ratePerJob);
    }
}