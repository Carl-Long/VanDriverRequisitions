using VanDriverRequisitions.Domain.Entities.STD;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public interface IStdRequisitionLimitValidator
{
    Task ValidateAsync(StdRequisition requisition, CancellationToken cancellationToken);
}