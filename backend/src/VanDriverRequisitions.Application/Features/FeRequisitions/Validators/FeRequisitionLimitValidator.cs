using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class FeRequisitionLimitValidator(IApplicationDbContext context) : IFeRequisitionLimitValidator
{
    public async Task ValidateAsync(FeRequisition requisition, CancellationToken cancellationToken)
    {
        var rules = await context.RequisitionLimitRules
            .Where(x =>
                x.Category == RequisitionRowCategory.GeneralTask ||
                x.Category == RequisitionRowCategory.Mileage ||
                x.Category == RequisitionRowCategory.Transfer ||
                x.Category == RequisitionRowCategory.AdditionalCost)
            .ToListAsync(cancellationToken);

        var failures = new List<ValidationFailure>();

        foreach (var task in requisition.FeGeneralTasks)
        {
            var rule = rules.FirstOrDefault(x =>
                x.FeTaskTypeId == task.FeTaskTypeId);

            if (rule is null)
            {
                failures.Add(
                    new ValidationFailure(
                        "Form",
                        $"No limit rule is configured for {task.TaskTypeName}."));

                continue;
            }

            var dailyValues = new[]
            {
                task.Week.Sunday,
                task.Week.Monday,
                task.Week.Tuesday,
                task.Week.Wednesday,
                task.Week.Thursday,
                task.Week.Friday,
                task.Week.Saturday
            };

            for (var i = 0; i < dailyValues.Length; i++)
            {
                var value = dailyValues[i];

                if (value > rule.MaxQuantity)
                {
                    failures.Add(
                        new ValidationFailure(
                            nameof(task.TotalNumber),
                            $"{task.TaskTypeName} exceeds daily maximum of {rule.MaxQuantity} on {GetDayName(i)}."));
                }
            }

            if (task.RatePerJob > rule.MaxRate)
            {
                failures.Add(
                    new ValidationFailure(
                        nameof(task.RatePerJob),
                        $"{task.TaskTypeName} exceeds maximum rate of £{rule.MaxRate:0.00}."));
            }
        }
        
        var mileageRule = rules.FirstOrDefault(x =>
            x.Category == RequisitionRowCategory.Mileage);

        foreach (var mileage in requisition.FeMileages)
        {
            if (mileageRule is null)
            {
                failures.Add(
                    new ValidationFailure(
                        "Form",
                        "No limit rule is configured for mileage."));

                continue;
            }

            var dailyValues = new[]
            {
                mileage.Week.Sunday,
                mileage.Week.Monday,
                mileage.Week.Tuesday,
                mileage.Week.Wednesday,
                mileage.Week.Thursday,
                mileage.Week.Friday,
                mileage.Week.Saturday
            };

            for (var i = 0; i < dailyValues.Length; i++)
            {
                var value = dailyValues[i];

                if (value > mileageRule.MaxQuantity)
                {
                    failures.Add(
                        new ValidationFailure(
                            nameof(mileage.TotalMiles),
                            $"Mileage exceeds daily maximum of {mileageRule.MaxQuantity} on {GetDayName(i)}."));
                }
            }

            if (mileage.RatePerMile > mileageRule.MaxRate)
            {
                failures.Add(
                    new ValidationFailure(
                        nameof(mileage.RatePerMile),
                        $"Mileage exceeds maximum rate of £{mileageRule.MaxRate:0.00}."));
            }
        }
        
        var transferRule = rules.FirstOrDefault(x =>
            x.Category == RequisitionRowCategory.Transfer);

        foreach (var transfer in requisition.FeTransfers)
        {
            if (transferRule is null)
            {
                failures.Add(
                    new ValidationFailure(
                        "Form",
                        "No limit rule is configured for transfers."));

                continue;
            }

            var dailyValues = new[]
            {
                transfer.Week.Sunday,
                transfer.Week.Monday,
                transfer.Week.Tuesday,
                transfer.Week.Wednesday,
                transfer.Week.Thursday,
                transfer.Week.Friday,
                transfer.Week.Saturday
            };

            for (var i = 0; i < dailyValues.Length; i++)
            {
                var value = dailyValues[i];

                if (value > transferRule.MaxQuantity)
                {
                    failures.Add(
                        new ValidationFailure(
                            nameof(transfer.TotalNumber),
                            $"Transfer exceeds daily maximum of {transferRule.MaxQuantity} on {GetDayName(i)}."));
                }
            }

            if (transfer.RatePerJob > transferRule.MaxRate)
            {
                failures.Add(
                    new ValidationFailure(
                        nameof(transfer.RatePerJob),
                        $"Transfer exceeds maximum rate of £{transferRule.MaxRate:0.00}."));
            }
        }
        
        var additionalCostRule = rules.FirstOrDefault(x => x.Category == RequisitionRowCategory.AdditionalCost);

        foreach (var additionalCost in requisition.FeAdditionalCosts)
        {
            if (additionalCost.ChargingOption == ChargingOption.Job)
            {
                if (additionalCostRule is null)
                {
                    failures.Add(new ValidationFailure("Form", "No limit rule is configured for additional costs."));
                    continue;
                }

                if (additionalCost.TotalNumber > additionalCostRule.MaxQuantity)
                {
                    failures.Add(new ValidationFailure(nameof(additionalCost.TotalNumber), $"Additional cost exceeds maximum quantity of {additionalCostRule.MaxQuantity}."));
                }

                if (additionalCost.RatePerJob > additionalCostRule.MaxRate)
                {
                    failures.Add(new ValidationFailure(nameof(additionalCost.RatePerJob), $"Additional cost exceeds maximum rate of £{additionalCostRule.MaxRate:0.00}."));
                }
                
                continue;
            }

            if (additionalCost.ChargingOption == ChargingOption.Mileage)
            {
                if (mileageRule is null)
                {
                    failures.Add(new ValidationFailure("Form", "No limit rule is configured for mileage."));
                    continue;
                }

                if (additionalCost.Miles > mileageRule.MaxQuantity)
                {
                    failures.Add(new ValidationFailure(nameof(additionalCost.Miles), $"Additional cost mileage exceeds maximum mileage of {mileageRule.MaxQuantity}."));
                }

                if (additionalCost.RatePerMile > mileageRule.MaxRate)
                {
                    failures.Add(new ValidationFailure(nameof(additionalCost.RatePerMile), $"Additional cost mileage exceeds maximum rate of £{mileageRule.MaxRate:0.00}."));
                }
            }
        }
        
        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }
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