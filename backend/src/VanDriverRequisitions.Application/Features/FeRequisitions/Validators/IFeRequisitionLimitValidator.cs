using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeRequisitions.Validators;

public interface IFeRequisitionLimitValidator
{
    Task ValidateAsync(FeRequisition requisition, CancellationToken cancellationToken);
}