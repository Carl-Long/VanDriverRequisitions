using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.FeReasons.Dtos;
using VanDriverRequisitions.Application.Features.FeReasons.Mappings;
using VanDriverRequisitions.Domain.Entities.FE;

namespace VanDriverRequisitions.Application.Features.FeReasons.Services;

public class FeReasonService(IApplicationDbContext context, IValidatorService validator) : IFeReasonService
{
    public async Task<List<FeReasonDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<FeReason> query = context.FeReasons;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .Select(FeReasonProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<FeReasonDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var feReason = await context.FeReasons
            .Where(x => x.Id == id)
            .Select(FeReasonProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return feReason ?? throw new NotFoundException(
            $"FE Reason with ID '{id}' was not found.");
    }

    public async Task<FeReasonDto> CreateAsync(CreateFeReasonDto createFeReasonDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createFeReasonDto, cancellationToken);

        var reasonExists = await context.FeReasons
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Reason == createFeReasonDto.Reason.Trim(), cancellationToken);

        if (reasonExists)
            throw new ConflictException($"A reason with text '{createFeReasonDto.Reason.Trim()}' already exists.");

        var newReason = new FeReason
        {
            Reason = createFeReasonDto.Reason.Trim(),
        };

        context.FeReasons.Add(newReason);
        await context.SaveChangesAsync(cancellationToken);

        return FeReasonMapper.ToSummaryDto(newReason);
    }

    public async Task<FeReasonDto> UpdateAsync(Guid id, UpdateFeReasonDto updateFeReasonDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateFeReasonDto, cancellationToken);

        var existingReason = await context.FeReasons
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingReason is null)
        {
            throw new NotFoundException(
                $"FE Reason with ID '{id}' was not found.");
        }

        var reasonExists = await context.FeReasons
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Reason == updateFeReasonDto.Reason.Trim() && x.Id != id, cancellationToken);

        if (reasonExists)
            throw new ConflictException($"A reason with text '{updateFeReasonDto.Reason.Trim()}' already exists.");

        existingReason.Reason = updateFeReasonDto.Reason.Trim();

        await context.SaveChangesAsync(cancellationToken);

        return FeReasonMapper.ToSummaryDto(existingReason);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingReason = await context.FeReasons
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingReason is null)
        {
            throw new NotFoundException(
                $"FE Reason with ID '{id}' was not found.");
        }

        existingReason.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingReason = await context.FeReasons
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingReason is null)
        {
            throw new NotFoundException(
                $"FE Reason with ID '{id}' was not found.");
        }

        existingReason.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }
}
