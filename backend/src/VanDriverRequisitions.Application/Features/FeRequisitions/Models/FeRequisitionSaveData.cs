using VanDriverRequisitions.Application.Features.VanDrivers.Dtos;
using VanDriverRequisitions.Domain.Entities.FE.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Models;

public sealed record FeRequisitionSaveData(
    VanDriverLookupDto DriverSummary,
    FeRequisitionUpdateModel UpdateModel,
    bool IsShopActive);