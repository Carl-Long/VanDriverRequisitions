using Microsoft.EntityFrameworkCore;
using VanDriverRequisitions.Application.Common.Interfaces;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;

public sealed class RequisitionLimitRuleProvider(IApplicationDbContext context) : IRequisitionLimitRuleProvider
{
    public async Task<IReadOnlyList<RequisitionLimitRule>> GetFeLimitRulesAsync(CancellationToken cancellationToken)
    {
        return await context.RequisitionLimitRules
            .AsNoTracking()
            .Where(x =>
                x.Fascia == Fascia.Fe &&
                (
                    x.Category == RequisitionRowCategory.GeneralTask ||
                    x.Category == RequisitionRowCategory.Mileage ||
                    x.Category == RequisitionRowCategory.Transfer ||
                    x.Category == RequisitionRowCategory.AdditionalCost
                ))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RequisitionLimitRule>> GetStdLimitRulesAsync(CancellationToken cancellationToken)
    {
        return await context.RequisitionLimitRules
            .AsNoTracking()
            .Where(x =>
                x.Fascia == Fascia.Std &&
                (
                    x.Category == RequisitionRowCategory.Mileage ||
                    x.Category == RequisitionRowCategory.FlatCharge ||
                    x.Category == RequisitionRowCategory.VanPack
                ))
            .ToListAsync(cancellationToken);
    }
}