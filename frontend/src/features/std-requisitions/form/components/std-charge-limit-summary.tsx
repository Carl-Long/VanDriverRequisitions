import { Info } from "lucide-react";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";

import {
    STD_CHARGE_TYPE,
    type StdChargeType,
} from "../../constants/std-charge-type.constants";

type Props = {
    chargeType: StdChargeType;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
};

function renderMileageLimits(rule: RequisitionLimitRuleSummary) {
    return (
        <div className="mt-1 text-muted-foreground">
            Maximum miles:{" "}
            <strong className="text-foreground">
                {rule.maxQuantity}
            </strong>
            {" "}• Maximum rate per mile:{" "}
            <strong className="text-foreground">
                {formatCurrencyGB(rule.maxRate)}
            </strong>
        </div>
    );
}

function renderFlatChargeLimit(rule: RequisitionLimitRuleSummary) {
    return (
        <div className="mt-1 text-muted-foreground">
            Maximum flat charge:{" "}
            <strong className="text-foreground">
                {formatCurrencyGB(rule.maxRate)}
            </strong>
        </div>
    );
}

export function StdChargeLimitSummary({
    chargeType,
    mileageLimitRule,
    flatChargeLimitRule,
}: Readonly<Props>) {
    const isMileage = chargeType === STD_CHARGE_TYPE.Mileage;
    const activeRule = isMileage ? mileageLimitRule : flatChargeLimitRule;
    const title = isMileage ? "Mileage Limits" : "Flat Charge Limits";

    let limitContent = (
        <div className="mt-1 text-muted-foreground">
            No limit rule is configured for this option.
        </div>
    );

    if (activeRule && isMileage) {
        limitContent = renderMileageLimits(activeRule);
    }

    if (activeRule && !isMileage) {
        limitContent = renderFlatChargeLimit(activeRule);
    }

    return (
        <div className="flex gap-3 rounded-xl border border-border bg-surface-subtle p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <div className="text-sm">
                <div className="font-medium">{title}</div>

                {limitContent}
            </div>
        </div>
    );
}