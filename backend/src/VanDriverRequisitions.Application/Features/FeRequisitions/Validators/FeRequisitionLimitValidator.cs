using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public sealed class FeRequisitionLimitValidator(IApplicationDbContext context) : IFeRequisitionLimitValidator
{
    public async Task ValidateAsync(
        FeRequisition requisition,
        CancellationToken cancellationToken)
    {
        var rules = await context.RequisitionLimitRules
            .Where(x => x.Category == RequisitionRowCategory.GeneralTask)
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