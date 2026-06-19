using VanDriverRequisitions.Application.Features.StdRequisitions.Dtos;
using VanDriverRequisitions.Application.Features.StdRequisitions.Models;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Builders;

public interface IStdRequisitionSaveDataBuilder
{
    Task<StdRequisitionSaveData> BuildAsync(SaveStdRequisitionDto saveStdRequisitionDto, CancellationToken cancellationToken);
}