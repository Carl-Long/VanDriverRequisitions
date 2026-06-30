using FluentValidation;
using FluentValidation.Results;
using VanDriverRequisitions.Application.Features.RequisitionLimitRules.Services;
using VanDriverRequisitions.Domain.Entities.Common;
using VanDriverRequisitions.Domain.Entities.STD;
using VanDriverRequisitions.Domain.Enums;

namespace VanDriverRequisitions.Application.Features.StdRequisitions.Validators;

public sealed class StdRequisitionLimitValidator(IRequisitionLimitRuleProvider limitRuleProvider) : IStdRequisitionLimitValidator
{
    public async Task ValidateAsync(StdRequisition requisition, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(requisition);

        var rules = await limitRuleProvider.GetStdLimitRulesAsync(cancellationToken);        var failures = new List<ValidationFailure>();

        ValidatePickups(requisition.Pickups, rules, failures);
        ValidateTransfers(requisition.Transfers, rules, failures);
        ValidateCollectionChargesBanksAndBins(
            requisition.CollectionChargesBanksAndBins,
            rules,
            failures);
        ValidateCollectionVanPacks(requisition.CollectionVanPacks, rules, failures);
        ValidateAdditionalCosts(requisition.AdditionalCosts, rules, failures);

        if (failures.Count != 0)
        {
            throw new ValidationException(failures);
        }
    }
    
    private static void ValidatePickups(
        IEnumerable<StdPickup> pickups,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var mileageRule = FindCategoryRule(rules, RequisitionRowCategory.Mileage);
        var flatChargeRule = FindCategoryRule(rules, RequisitionRowCategory.FlatCharge);

        foreach (var pickup in pickups)
        {
            ValidateCharge(
                pickup.ChargeType,
                pickup.Miles,
                pickup.RatePerMile,
                pickup.FlatCharge,
                mileageRule,
                flatChargeRule,
                "Pickup",
                failures);
        }
    }

    private static void ValidateTransfers(
        IEnumerable<StdTransfer> transfers,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var mileageRule = FindCategoryRule(rules, RequisitionRowCategory.Mileage);
        var flatChargeRule = FindCategoryRule(rules, RequisitionRowCategory.FlatCharge);

        foreach (var transfer in transfers)
        {
            ValidateCharge(
                transfer.ChargeType,
                transfer.Miles,
                transfer.RatePerMile,
                transfer.FlatCharge,
                mileageRule,
                flatChargeRule,
                "Transfer",
                failures);
        }
    }

    private static void ValidateCollectionChargesBanksAndBins(
        IEnumerable<StdCollectionChargeBanksAndBins> collectionCharges,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var mileageRule = FindCategoryRule(rules, RequisitionRowCategory.Mileage);
        var flatChargeRule = FindCategoryRule(rules, RequisitionRowCategory.FlatCharge);

        foreach (var charge in collectionCharges)
        {
            ValidateCharge(
                charge.ChargeType,
                charge.Miles,
                charge.RatePerMile,
                charge.FlatCharge,
                mileageRule,
                flatChargeRule,
                "Banks & Bins",
                failures);
        }
    }

    private static void ValidateCollectionVanPacks(
        IEnumerable<StdCollectionVanPack> vanPacks,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var vanPackRule = FindCategoryRule(rules, RequisitionRowCategory.VanPack);

        foreach (var vanPack in vanPacks)
        {
            if (vanPackRule is null)
            {
                failures.Add(new ValidationFailure("Form", "No limit rule is configured for van packs."));
                continue;
            }

            ValidateSingleQuantity(
                vanPack.VanPacksOut,
                vanPackRule.MaxQuantity,
                nameof(vanPack.VanPacksOut),
                "Van packs",
                failures);

            ValidateFixedRate(
                vanPack.RatePerVanPack,
                vanPackRule.MaxRate,
                nameof(vanPack.RatePerVanPack),
                "Van pack price",
                failures);
        }
    }

    private static void ValidateAdditionalCosts(
        IEnumerable<StdAdditionalCost> additionalCosts,
        IReadOnlyCollection<RequisitionLimitRule> rules,
        List<ValidationFailure> failures)
    {
        var mileageRule = FindCategoryRule(rules, RequisitionRowCategory.Mileage);
        var flatChargeRule = FindCategoryRule(rules, RequisitionRowCategory.FlatCharge);

        foreach (var additionalCost in additionalCosts)
        {
            ValidateCharge(
                additionalCost.ChargeType,
                additionalCost.Miles,
                additionalCost.RatePerMile,
                additionalCost.FlatCharge,
                mileageRule,
                flatChargeRule,
                "Additional cost",
                failures);
        }
    }

    private static void ValidateCharge(
        StdChargeType chargeType,
        int? miles,
        decimal? ratePerMile,
        decimal? flatCharge,
        RequisitionLimitRule? mileageRule,
        RequisitionLimitRule? flatChargeRule,
        string label,
        List<ValidationFailure> failures)
    {
        switch (chargeType)
        {
            case StdChargeType.Mileage:
                ValidateMileageCharge(miles, ratePerMile, mileageRule, label, failures);
                break;

            case StdChargeType.FlatCharge:
                ValidateFlatCharge(flatCharge, flatChargeRule, label, failures);
                break;

            default:
                failures.Add(new ValidationFailure("Form", $"Unknown charge type for {label}."));
                break;
        }
    }

    private static void ValidateMileageCharge(
        int? miles,
        decimal? ratePerMile,
        RequisitionLimitRule? mileageRule,
        string label,
        List<ValidationFailure> failures)
    {
        if (mileageRule is null)
        {
            failures.Add(new ValidationFailure("Form", "No limit rule is configured for STD mileage."));
            return;
        }

        ValidateSingleQuantity(
            miles,
            mileageRule.MaxQuantity,
            "Miles",
            $"{label} mileage",
            failures);

        ValidateMaximumRate(
            ratePerMile,
            mileageRule.MaxRate,
            "RatePerMile",
            $"{label} mileage",
            failures);
    }

    private static void ValidateFlatCharge(
        decimal? flatCharge,
        RequisitionLimitRule? flatChargeRule,
        string label,
        List<ValidationFailure> failures)
    {
        if (flatChargeRule is null)
        {
            failures.Add(new ValidationFailure("Form", "No limit rule is configured for STD flat charges."));
            return;
        }

        ValidateMaximumRate(
            flatCharge,
            flatChargeRule.MaxRate,
            "FlatCharge",
            $"{label} flat charge",
            failures);
    }

    private static RequisitionLimitRule? FindCategoryRule(
        IReadOnlyCollection<RequisitionLimitRule> rules,
        RequisitionRowCategory category)
    {
        return rules.FirstOrDefault(x => x.Category == category);
    }

    private static void ValidateSingleQuantity(
        int? quantity,
        int maxQuantity,
        string propertyName,
        string label,
        List<ValidationFailure> failures)
    {
        if ((quantity ?? 0) <= maxQuantity)
        {
            return;
        }

        failures.Add(new ValidationFailure(
            propertyName,
            $"{label} exceeds maximum quantity of {maxQuantity}."));
    }

    private static void ValidateMaximumRate(
        decimal? rate,
        decimal maxRate,
        string propertyName,
        string label,
        List<ValidationFailure> failures)
    {
        if ((rate ?? 0) <= maxRate)
        {
            return;
        }

        failures.Add(new ValidationFailure(
            propertyName,
            $"{label} exceeds maximum rate of £{maxRate:0.00}."));
    }

    private static void ValidateFixedRate(
        decimal rate,
        decimal expectedRate,
        string propertyName,
        string label,
        List<ValidationFailure> failures)
    {
        if (rate == expectedRate)
        {
            return;
        }

        failures.Add(new ValidationFailure(
            propertyName,
            $"{label} must be £{expectedRate:0.00}."));
    }
}