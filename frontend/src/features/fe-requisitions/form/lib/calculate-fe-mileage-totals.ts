import { FeMileageDraft } from "../types/fe-mileage-draft";
import { FeMileageTotals } from "../types/fe-mileage-totals";

export function calculateFeMileageTotals(rows: FeMileageDraft[]): FeMileageTotals {
    return rows.reduce<FeMileageTotals>(
        (totals, row) => ({
            sunday: totals.sunday + (row.quantities.sunday ?? 0),
            monday: totals.monday + (row.quantities.monday ?? 0),
            tuesday: totals.tuesday + (row.quantities.tuesday ?? 0),
            wednesday: totals.wednesday + (row.quantities.wednesday ?? 0),
            thursday: totals.thursday + (row.quantities.thursday ?? 0),
            friday: totals.friday + (row.quantities.friday ?? 0),
            saturday: totals.saturday + (row.quantities.saturday ?? 0),
            totalMiles: totals.totalMiles + row.totalMiles,
            subtotal: totals.subtotal + row.totalValue,
        }),
        {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );
}