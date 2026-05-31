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
                continue;
            }

            if (task.TotalNumber > rule.MaxQuantity)
            {
                failures.Add(
                    new ValidationFailure(
                        nameof(task.TotalNumber),
                        $"{task.TaskTypeName} exceeds maximum quantity of {rule.MaxQuantity}."));
            }

            if (task.RatePerJob > rule.MaxRate)
            {
                failures.Add(
                    new ValidationFailure(
                        nameof(task.RatePerJob),
                        $"{task.TaskTypeName} exceeds maximum rate of {rule.MaxRate:C}."));
            }
        }

        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }
    }
}