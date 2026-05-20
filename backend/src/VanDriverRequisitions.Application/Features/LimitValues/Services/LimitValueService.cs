using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.LimitValues.Dtos;
using VanDriverRequisitions.Application.Features.LimitValues.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.LimitValues.Services;

public class LimitValueService(IApplicationDbContext context, IValidatorService validator) : ILimitValueService
{
    public async Task<List<LimitValueDto>> GetAllAsync(bool includeInactive, CancellationToken cancellationToken = default)
    {
        IQueryable<LimitValue> query = context.LimitValues;

        if (includeInactive)
        {
            query = query.IgnoreQueryFilters();
        }

        return await query
            .Select(LimitValueProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<LimitValueDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var limitValue = await context.LimitValues
            .Where(x => x.Id == id)
            .Select(LimitValueProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return limitValue ?? throw new NotFoundException(
            $"Limit Value with ID '{id}' was not found.");
    }

    public async Task<LimitValueDto> CreateAsync(CreateLimitValueDto dto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(dto, cancellationToken);

        var titleExists = await context.LimitValues
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Title == dto.Title.Trim(), cancellationToken);

        if (titleExists)
            throw new ConflictException($"A limit value with title '{dto.Title.Trim()}' already exists.");

        var newLimitValue = new LimitValue
        {
            Title = dto.Title.Trim(),
            NameOfValue = dto.NameOfValue.Trim(),
            Fascia = dto.Fascia,
            TypeOfLimitation = dto.TypeOfLimitation,
            NumericalLimit = dto.NumericalLimit,
            CurrencyLimit = dto.CurrencyLimit,
        };

        context.LimitValues.Add(newLimitValue);
        await context.SaveChangesAsync(cancellationToken);

        return LimitValueMapper.ToSummaryDto(newLimitValue);
    }

    public async Task<LimitValueDto> UpdateAsync(Guid id, UpdateLimitValueDto dto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(dto, cancellationToken);

        var existing = await context.LimitValues
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existing is null)
            throw new NotFoundException($"Limit Value with ID '{id}' was not found.");

        var titleExists = await context.LimitValues
            .IgnoreQueryFilters()
            .AnyAsync(x => x.Title == dto.Title.Trim() && x.Id != id, cancellationToken);

        if (titleExists)
            throw new ConflictException($"A limit value with title '{dto.Title.Trim()}' already exists.");

        existing.Title = dto.Title.Trim();
        existing.NameOfValue = dto.NameOfValue.Trim();
        existing.Fascia = dto.Fascia;
        existing.TypeOfLimitation = dto.TypeOfLimitation;
        existing.NumericalLimit = dto.NumericalLimit;
        existing.CurrencyLimit = dto.CurrencyLimit;

        await context.SaveChangesAsync(cancellationToken);

        return LimitValueMapper.ToSummaryDto(existing);
    }

    public async Task ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await context.LimitValues
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existing is null)
            throw new NotFoundException($"Limit Value with ID '{id}' was not found.");

        existing.IsActive = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await context.LimitValues
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existing is null)
            throw new NotFoundException($"Limit Value with ID '{id}' was not found.");

        existing.IsActive = false;
        await context.SaveChangesAsync(cancellationToken);
    }
}
