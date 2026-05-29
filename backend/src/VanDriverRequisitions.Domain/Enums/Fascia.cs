using System.ComponentModel.DataAnnotations;

namespace VanDriverRequisitions.Domain.Enums;

public enum Fascia
{
    [Display(Name ="FE")]
    Fe = 0,
    [Display(Name = "STD")]
    Std = 1
}