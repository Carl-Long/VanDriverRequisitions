using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules;

public static class RequisitionLimitRuleCategoryCompatibility
{
    public static bool IsAllowed(Fascia fascia, RequisitionRowCategory category)
    {
        return fascia switch
        {
            Fascia.Fe => category is
                RequisitionRowCategory.GeneralTask or
                RequisitionRowCategory.Mileage or
                RequisitionRowCategory.Transfer or
                RequisitionRowCategory.AdditionalCost,

            Fascia.Std => category is
                RequisitionRowCategory.Mileage or
                RequisitionRowCategory.FlatCharge or
                RequisitionRowCategory.VanPack,

            _ => false
        };
    }
}