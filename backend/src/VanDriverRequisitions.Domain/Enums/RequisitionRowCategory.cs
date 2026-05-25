using System.ComponentModel.DataAnnotations;

namespace VanDriverRequisitions.Domain.Enums;

public enum RequisitionRowCategory
{
    [Display(Name = "General Task")]
    GeneralTask = 0,

    [Display(Name = "Mileage")]
    Mileage = 1,

    [Display(Name = "Transfer")]
    Transfer = 2,

    [Display(Name = "Additional Cost")]
    AdditionalCost = 3
}