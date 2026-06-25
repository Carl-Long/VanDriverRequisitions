using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Extensions;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Application.Common.Models;
using VanDriverRequisitions.Application.Exceptions;
using VanDriverRequisitions.Application.Features.SubmitWindows.Dtos;
using VanDriverRequisitions.Application.Features.SubmitWindows.Mappings;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.SubmitWindows.Services;

public class SubmitWindowService(IApplicationDbContext context, IValidatorService validator, TimeProvider timeProvider) : ISubmitWindowService
{
    public async Task<PagedResult<SubmitWindowSummaryDto>> GetAllAsync(SubmitWindowQueryDto query, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(query, cancellationToken);

        var filteredQuery = BuildFilteredQuery(query.Filter, timeProvider.GetUtcDateTime());
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var items = await filteredQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(SubmitWindowProjections.AsSummaryDto)
            .ToListAsync(cancellationToken);

        return new PagedResult<SubmitWindowSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize,
        };
    }

    public async Task<SubmitWindowSummaryDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var submitWindow = await context.SubmitWindows
            .Where(x => x.Id == id)
            .Select(SubmitWindowProjections.AsSummaryDto)
            .FirstOrDefaultAsync(cancellationToken);

        return submitWindow ?? throw new NotFoundException($"Submit window with ID '{id}' was not found.");
    }

    public async Task<SubmitWindowSummaryDto> CreateAsync(CreateSubmitWindowDto createDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(createDto, cancellationToken);
        await CheckForOverlappingAsync(createDto.OpenFrom, createDto.OpenTo, cancellationToken);

        var newWindow = SubmitWindow.Create(createDto.OpenFrom, createDto.OpenTo);

        context.SubmitWindows.Add(newWindow);
        await context.SaveChangesAsync(cancellationToken);

        return SubmitWindowMapper.ToSummaryDto(newWindow);
    }

    public async Task<SubmitWindowSummaryDto> UpdateAsync(Guid id, UpdateSubmitWindowDto updateDto, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAsync(updateDto, cancellationToken);

        var existingWindow = await LoadForUpdateAsync(id, cancellationToken);

        await CheckForOverlappingAsync(updateDto.OpenFrom, updateDto.OpenTo, cancellationToken, id);

        existingWindow.Update(updateDto.OpenFrom, updateDto.OpenTo);

        await context.SaveChangesAsync(cancellationToken);

        return SubmitWindowMapper.ToSummaryDto(existingWindow);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existingWindow = await context.SubmitWindows
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingWindow is null)
            throw new NotFoundException($"Submit window with ID '{id}' was not found.");
        
        context.SubmitWindows.Remove(existingWindow);
        await context.SaveChangesAsync(cancellationToken);
    }
    
    public async Task<SubmitWindowStatusDto> GetStatusAsync(CancellationToken cancellationToken = default)
    {
        var now = timeProvider.GetUtcDateTime();

        var currentWindow = await context.SubmitWindows
            .Where(x => x.OpenFrom <= now && x.OpenTo >= now)
            .OrderBy(x => x.OpenFrom)
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
    
    private async Task<SubmitWindow> LoadForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await context.SubmitWindows.FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
               ?? throw new NotFoundException($"Submit window with ID '{id}' was not found.");
    }

    private async Task CheckForOverlappingAsync(DateTime openFrom, DateTime openTo, CancellationToken cancellationToken, Guid? id = null)
    {
        var overlapping = await context.SubmitWindows
            .AnyAsync(x => x.Id != id && x.OpenFrom < openTo && x.OpenTo > openFrom, cancellationToken);

        if (overlapping)
        {
            throw new BadRequestException("This window overlaps with an upcoming or completed submit window.");
        }
    }

    private IQueryable<SubmitWindow> BuildFilteredQuery(SubmitWindowFilter filter, DateTime now)
    {
        var query = context.SubmitWindows.AsNoTracking();

        return filter switch
        {
            SubmitWindowFilter.Active => query
                .Where(x => x.OpenTo >= now)
                // active first, then upcoming
                .OrderBy(x => x.OpenFrom > now ? 1 : 0)
                // active => ending soonest
                // upcoming => starting soonest
                .ThenBy(x => x.OpenFrom > now ? x.OpenFrom : x.OpenTo)
                .ThenBy(x => x.Id),

            SubmitWindowFilter.Past => query
                .Where(x => x.OpenTo < now)
                .OrderByDescending(x => x.OpenTo)
                .ThenByDescending(x => x.Id),

            SubmitWindowFilter.Deleted => query
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(x => x.DeletedAtUtc != null)
                .OrderByDescending(x => x.DeletedAtUtc)
                .ThenByDescending(x => x.Id),

            _ => throw new ArgumentOutOfRangeException(nameof(filter), filter, null)
        };
    }
}
