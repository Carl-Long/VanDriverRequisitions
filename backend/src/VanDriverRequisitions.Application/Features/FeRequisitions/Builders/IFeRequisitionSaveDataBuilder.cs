using VanDriverRequisitions.Application.Features.FeRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.FeRequisitions.Models;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Builders;

public interface IFeRequisitionSaveDataBuilder
{
    Task<FeRequisitionSaveData> BuildAsync(SaveFeRequisitionDto dto, FeRequisition? existingRequisition, CancellationToken cancellationToken);}