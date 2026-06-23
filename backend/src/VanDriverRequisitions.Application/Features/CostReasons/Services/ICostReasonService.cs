using VanDriverRequisitions.Application.Features.CostReasons.Dtos;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.CostReasons.Services;

public interface ICostReasonService
{
    Task<List<CostReasonSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default);
    Task<List<CostReasonLookupDto>> GetActiveLookupsAsync(Fascia fascia, CancellationToken cancellationToken = default);
    Task<CostReasonSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CostReasonSummaryDto> CreateAsync(CreateCostReasonDto dto, CancellationToken cancellationToken = default);
    Task<CostReasonSummaryDto> UpdateAsync(Guid id, UpdateCostReasonDto dto, CancellationToken cancellationToken = default);
    Task ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}