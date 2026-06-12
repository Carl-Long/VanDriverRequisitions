import { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import { FeAdditionalCostTotals } from "../types/fe-additional-cost-totals";

export function calculateFeAdditionalCostTotals(
    rows: FeAdditionalCostDraft[],
): FeAdditionalCostTotals {
    return rows.reduce<FeAdditionalCostTotals>(
        (totals, row) => ({
            totalJobQuantity:
                totals.totalJobQuantity +
                (row.chargingOption === "Job" ? row.totalNumber ?? 0 : 0),

            totalMiles:
                totals.totalMiles +
                (row.chargingOption === "Mileage" ? row.miles ?? 0 : 0),

            subtotal: totals.subtotal + row.totalValue,
        }),
        {
            totalJobQuantity: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );
}