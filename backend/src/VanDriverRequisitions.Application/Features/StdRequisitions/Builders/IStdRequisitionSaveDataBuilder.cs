using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Models;
using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Builders;

public interface IStdRequisitionSaveDataBuilder
{
    Task<StdRequisitionSaveData> BuildAsync(SaveStdRequisitionDto dto, StdRequisition? existingRequisition, CancellationToken cancellationToken);}