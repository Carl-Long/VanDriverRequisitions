using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;
using VanDriverRequisitions.Application.Features.SubmitWindows.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Services;

public class SubmitWindowService(IApplicationDbContext context, IValidatorService validator) : ISubmitWindowService
{
    public async Task<PagedResult<SubmitWindowDto>> GetAllAsync(int page, int pageSize, bool includeDeleted, CancellationToken cancellationToken = default)
    {
        IQueryable<SubmitWindow> query = context.SubmitWindows;

        if (includeDeleted)
        {
            query = query.IgnoreQueryFilters();
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.OpenFrom)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(SubmitWindowProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<SubmitWindowDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<SubmitWindowDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var submitWindow = await context.SubmitWindows
            .Where(x => x.Id == id)
            .Select(SubmitWindowProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return submitWindow ?? throw new NotFoundException(
            $"Submit window with ID '{id}' was not found.");
    }

    public async Task<SubmitWindowDto> CreateAsync(CreateSubmitWindowDto createDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createDto, cancellationToken);

        var overlapping = await context.SubmitWindows
            .AnyAsync(x => x.OpenFrom < createDto.OpenTo && x.OpenTo > createDto.OpenFrom, cancellationToken);

        if (overlapping)
            throw new ConflictException("This window overlaps with an existing submit window.");

        var newWindow = new SubmitWindow
        {
            OpenFrom = createDto.OpenFrom,
            OpenTo = createDto.OpenTo,
        };

        context.SubmitWindows.Add(newWindow);
        await context.SaveChangesAsync(cancellationToken);

        return SubmitWindowMapper.ToSummaryDto(newWindow);
    }

    public async Task<SubmitWindowDto> UpdateAsync(Guid id, UpdateSubmitWindowDto updateDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateDto, cancellationToken);

        var existingWindow = await context.SubmitWindows
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingWindow is null)
        {
            throw new NotFoundException(
                $"Submit window with ID '{id}' was not found.");
        }

        var overlapping = await context.SubmitWindows
            .AnyAsync(x => x.Id != id && x.OpenFrom < updateDto.OpenTo && x.OpenTo > updateDto.OpenFrom, cancellationToken);

        if (overlapping)
            throw new ConflictException("This window overlaps with an existing submit window.");

        existingWindow.OpenFrom = updateDto.OpenFrom;
        existingWindow.OpenTo = updateDto.OpenTo;

        await context.SaveChangesAsync(cancellationToken);

        return SubmitWindowMapper.ToSummaryDto(existingWindow);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingWindow = await context.SubmitWindows
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingWindow is null)
        {
            throw new NotFoundException(
                $"Submit window with ID '{id}' was not found.");
        }

        context.SubmitWindows.Remove(existingWindow);
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task RestoreAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingWindow = await context.SubmitWindows
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingWindow is null)
        {
            throw new NotFoundException(
                $"Submit window with ID '{id}' was not found.");
        }

        existingWindow.DeletedAtUtc = null;
        existingWindow.DeletedById = null;
        existingWindow.DeletedByNameSnapshot = null;

        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task<SubmitWindowStatusDto> GetStatusAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var currentWindow = await context.SubmitWindows
            .Where(x => x.OpenFrom <= now && x.OpenTo >= now)
            .Select(SubmitWindowProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        var nextWindow = await context.SubmitWindows
            .Where(x => x.OpenFrom > now)
            .OrderBy(x => x.OpenFrom)
            .Select(SubmitWindowProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return new SubmitWindowStatusDto
        {
            CurrentWindow = currentWindow,
            NextWindow = nextWindow,
            HasUpcoming = nextWindow is not null,
        };
    }
}
