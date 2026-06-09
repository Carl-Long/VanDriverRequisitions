using VanDriverRequisitions.Domain.Entities.Base;
using VanDriverRequisitions.Domain.Entities.Common.Models;
using VanDriverRequisitions.Domain.Entities.FE;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Domain.Entities.Common;

public class RequisitionLimitRule : AuditableEntity
{
    private RequisitionLimitRule() { } // EF

    public RequisitionRowCategory Category { get; private set; }
    public Guid? FeTaskTypeId { get; private set; }
    public FeTaskType? FeTaskType { get; private set; }
    public Fascia Fascia { get; private set; }
    public int MaxQuantity { get; private set; }
    public decimal MaxRate { get; private set; }

    public static RequisitionLimitRule Create(RequisitionLimitRuleDetails details)
    {
        var rule = new RequisitionLimitRule();
        rule.Update(details);
        return rule;
    }

    public void Update(RequisitionLimitRuleDetails details)
    {
        ArgumentNullException.ThrowIfNull(details);

        Validate(details);

        Category = details.Category;
        FeTaskTypeId = details.FeTaskTypeId;
        Fascia = details.Fascia;
        MaxQuantity = details.MaxQuantity;
        MaxRate = details.MaxRate;
    }

    private static void Validate(RequisitionLimitRuleDetails details)
    {
        if (details.MaxQuantity < 0)
        {
            throw new InvalidOperationException("Max quantity cannot be negative.");
        }

        if (details.MaxRate < 0)
        {
            throw new InvalidOperationException("Max rate cannot be negative.");
        }

        if (details.Category == RequisitionRowCategory.GeneralTask && details.FeTaskTypeId is null)
        {
            throw new InvalidOperationException("A task type is required for general task limit rules.");
        }

        if (details.Category != RequisitionRowCategory.GeneralTask && details.FeTaskTypeId is not null)
        {
            throw new InvalidOperationException("A task type can only be assigned to general task limit rules.");
        }
    }
}