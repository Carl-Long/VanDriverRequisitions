using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;
using VanDriverRequisitions.Domain.ValueObjects;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class FeRequisitionLimitValidator(IApplicationDbContext context) : IFeRequisitionLimitValidator
{
    public async Task ValidateAsync(FeRequisition requisition, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(requisition);

        var rules = await LoadRulesAsync(cancellationToken);
        var failures = new List<ValidationFailure>();

        ValidateGeneralTasks(requisition.FeGeneralTasks, rules, failures);
        ValidateMileages(requisition.FeMileages, rules, failures);
        ValidateTransfers(requisition.FeTransfers, rules, failures);
        ValidateAdditionalCosts(requisition.FeAdditionalCosts, rules, failures);

        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }
    }

    private async Task<List<RequisitionLimitRule>> LoadRulesAsync(CancellationToken cancellationToken)
    {
        return await context.RequisitionLimitRules
            .AsNoTracking()
            .Where(x =>
                x.Category == RequisitionRowCategory.GeneralTask ||
                x.Category == RequisitionRowCategory.Mileage ||
                x.Category == RequisitionRowCategory.Transfer ||
                x.Category == RequisitionRowCategory.AdditionalCost)
            .ToListAsync(cancellationToken);
    }

    private static void ValidateGeneralTasks(
        IEnumerable<FeGeneralTask> tasks,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        foreach (var task in tasks)
        {
            var rule = rules.FirstOrDefault(x =>
                x.Category == RequisitionRowCategory.GeneralTask &&
                x.FeTaskTypeId == task.FeTaskTypeId);

            if (rule is null)
            {
                failures.Add(new ValidationFailure("Form", $"No limit rule is configured for {task.TaskTypeName}."));
                continue;
            }

            ValidateDailyQuantities(
                GetDailyValues(task.Week),
                rule.MaxQuantity,
                nameof(task.TotalNumber),
                task.TaskTypeName,
                failures);

            ValidateRate(
                task.RatePerJob,
                rule.MaxRate,
                nameof(task.RatePerJob),
                task.TaskTypeName,
                failures);
        }
    }

    private static void ValidateMileages(
        IEnumerable<FeMileage> mileages,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var mileageRule = FindCategoryRule(rules, RequisitionRowCategory.Mileage);

        foreach (var mileage in mileages)
        {
            if (mileageRule is null)
            {
                failures.Add(new ValidationFailure("Form", "No limit rule is configured for mileage."));
                continue;
            }

            ValidateDailyQuantities(
                GetDailyValues(mileage.Week),
                mileageRule.MaxQuantity,
                nameof(mileage.TotalMiles),
                "Mileage",
                failures);

            ValidateRate(
                mileage.RatePerMile,
                mileageRule.MaxRate,
                nameof(mileage.RatePerMile),
                "Mileage",
                failures);
        }
    }

    private static void ValidateTransfers(
        IEnumerable<FeTransfer> transfers,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var transferRule = FindCategoryRule(rules, RequisitionRowCategory.Transfer);

        foreach (var transfer in transfers)
        {
            if (transferRule is null)
            {
                failures.Add(new ValidationFailure("Form", "No limit rule is configured for transfers."));
                continue;
            }

            ValidateDailyQuantities(
                GetDailyValues(transfer.Week),
                transferRule.MaxQuantity,
                nameof(transfer.TotalNumber),
                "Transfer",
                failures);

            ValidateRate(
                transfer.RatePerJob,
                transferRule.MaxRate,
                nameof(transfer.RatePerJob),
                "Transfer",
                failures);
        }
    }

    private static void ValidateAdditionalCosts(
        IEnumerable<FeAdditionalCost> additionalCosts,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var additionalCostRule = FindCategoryRule(rules, RequisitionRowCategory.AdditionalCost);
        var mileageRule = FindCategoryRule(rules, RequisitionRowCategory.Mileage);

        foreach (var additionalCost in additionalCosts)
        {
            switch (additionalCost.ChargingOption)
            {
                case ChargingOption.Job:
                    ValidateAdditionalCostJob(additionalCost, additionalCostRule, failures);
                    break;

                case ChargingOption.Mileage:
                    ValidateAdditionalCostMileage(additionalCost, mileageRule, failures);
                    break;

                default:
                    failures.Add(new ValidationFailure(nameof(additionalCost.ChargingOption), "Unknown additional cost charging option."));
                    break;
            }
        }
    }

    private static void ValidateAdditionalCostJob(
        FeAdditionalCost additionalCost,
        RequisitionLimitRule? rule,
        List<ValidationFailure> failures)
    {
        if (rule is null)
        {
            failures.Add(new ValidationFailure("Form", "No limit rule is configured for additional costs."));
            return;
        }

        ValidateSingleQuantity(
            additionalCost.TotalNumber,
            rule.MaxQuantity,
            nameof(additionalCost.TotalNumber),
            "Additional cost",
            failures);

        ValidateRate(
            additionalCost.RatePerJob,
            rule.MaxRate,
            nameof(additionalCost.RatePerJob),
            "Additional cost",
            failures);
    }

    private static void ValidateAdditionalCostMileage(
        FeAdditionalCost additionalCost,
        RequisitionLimitRule? mileageRule,
        List<ValidationFailure> failures)
    {
        if (mileageRule is null)
        {
            failures.Add(new ValidationFailure("Form", "No limit rule is configured for mileage."));
            return;
        }

        ValidateSingleQuantity(
            additionalCost.Miles,
            mileageRule.MaxQuantity,
            nameof(additionalCost.Miles),
            "Additional cost mileage",
            failures);

        ValidateRate(
            additionalCost.RatePerMile,
            mileageRule.MaxRate,
            nameof(additionalCost.RatePerMile),
            "Additional cost mileage",
            failures);
    }

    private static RequisitionLimitRule? FindCategoryRule(
        IReadOnlyCollection<RequisitionLimitRule> rules,
        RequisitionRowCategory category)
    {
        return rules.FirstOrDefault(x => x.Category == category);
    }

    private static int?[] GetDailyValues(WeeklyQuantities week)
    {
        return
        [
            week.Sunday,
            week.Monday,
            week.Tuesday,
            week.Wednesday,
            week.Thursday,
            week.Friday,
            week.Saturday
        ];
    }

    private static void ValidateDailyQuantities(
        IReadOnlyList<int?> dailyValues,
        int maxQuantity,
        string propertyName,
        string label,
        List<ValidationFailure> failures)
    {
        for (var i = 0; i < dailyValues.Count; i++)
        {
            var value = dailyValues[i] ?? 0;

            if (value <= maxQuantity)
            {
                continue;
            }

            failures.Add(new ValidationFailure(propertyName, $"{label} exceeds daily maximum of {maxQuantity} on {GetDayName(i)}."));
        }
    }

    private static void ValidateSingleQuantity(int? quantity, int maxQuantity, string propertyName, string label, List<ValidationFailure> failures)
    {
        if ((quantity ?? 0) <= maxQuantity) return;
        
        failures.Add(new ValidationFailure(propertyName, $"{label} exceeds maximum quantity of {maxQuantity}."));
    }

    private static void ValidateRate(decimal? rate, decimal maxRate, string propertyName, string label, List<ValidationFailure> failures)
    {
        if ((rate ?? 0) <= maxRate) return;

        failures.Add(new ValidationFailure(propertyName, $"{label} exceeds maximum rate of £{maxRate:0.00}."));
    }

    private static string GetDayName(int index) => index switch
    {
        0 => "Sunday",
        1 => "Monday",
        2 => "Tuesday",
        3 => "Wednesday",
        4 => "Thursday",
        5 => "Friday",
        6 => "Saturday",
        _ => "Unknown"
    };
}