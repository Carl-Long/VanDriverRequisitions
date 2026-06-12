using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Models;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Builders;

public interface IFeRequisitionSaveDataBuilder
{
    Task<FeRequisitionSaveData> BuildAsync(SaveFeRequisitionDto saveFeRequisitionDto, CancellationToken cancellationToken);
}