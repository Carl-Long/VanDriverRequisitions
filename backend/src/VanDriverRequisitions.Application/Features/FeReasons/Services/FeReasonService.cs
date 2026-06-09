using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeReasons.Dtos;
using VanDriverRequisitions.Application.Features.FeReasons.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeReasons.Services;

public class FeReasonService(IApplicationDbContext context, IValidatorService validator) : IFeReasonService
{
    public async Task<List<FeReasonSummaryDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<FeReason> query = context.FeReasons;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .AsNoTracking()
            .Select(FeReasonProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<FeReasonSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var feReason = await context.FeReasons
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(FeReasonProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return feReason ?? throw new NotFoundException($"FE Reason with ID '{id}' was not found.");
    }

    public async Task<FeReasonSummaryDto> CreateAsync(CreateFeReasonDto createFeReasonDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createFeReasonDto, cancellationToken);
        
        var newReason = new FeReason
        {
            Reason = createFeReasonDto.Reason.Trim()
        };

        context.FeReasons.Add(newReason);
        await SaveWithUniqueConstraintHandlingAsync(createFeReasonDto.Reason, cancellationToken);

        return FeReasonMapper.ToSummaryDto(newReason);
    }

    public async Task<FeReasonSummaryDto> UpdateAsync(Guid id, UpdateFeReasonDto updateFeReasonDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateFeReasonDto, cancellationToken);

        var reason = await LoadForUpdateAsync(id, cancellationToken);
        reason.Reason = updateFeReasonDto.Reason.Trim();

        await SaveWithUniqueConstraintHandlingAsync(updateFeReasonDto.Reason, cancellationToken);

        return FeReasonMapper.ToSummaryDto(reason);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reason = await LoadForUpdateAsync(id, cancellationToken);
        reason.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }
    
    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reason = await LoadForUpdateAsync(id, cancellationToken);
        reason.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }
    
    private async Task<FeReason> LoadForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.FeReasons
                   .IgnoreQueryFilters()
                   .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"FE Reason with ID '{id}' was not found.");
    }
    
    private async Task SaveWithUniqueConstraintHandlingAsync(string reason, CancellationToken cancellationToken)
    {
        try
        {
            await context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (DbExceptionHelper.IsUniqueConstraintViolation(ex))
        {
            throw new ValidationException(
            [
                new ValidationFailure("Reason", $"This reason '{reason}' already exists.")
            ]);
        }
    }
}
