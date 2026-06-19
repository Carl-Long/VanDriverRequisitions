using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.STD.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Models;

public sealed record StdRequisitionSaveData(
    VanDriverLookupDto DriverSummary,
    StdRequisitionUpdateModel UpdateModel,
    bool IsShopActive);