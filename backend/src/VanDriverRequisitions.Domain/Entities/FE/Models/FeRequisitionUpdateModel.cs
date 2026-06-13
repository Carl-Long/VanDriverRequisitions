namespace VanDriverRequisitions.Domain.Entities.FE.Models;

public sealed record FeRequisitionUpdateModel(
    RequisitionDetails Details,
    IReadOnlyCollection<FeGeneralTaskUpdateModel> GeneralTasks,
    IReadOnlyCollection<FeMileageUpdateModel> Mileages,
    IReadOnlyCollection<FeTransferUpdateModel> Transfers,
    IReadOnlyCollection<FeAdditionalCostUpdateModel> AdditionalCosts);