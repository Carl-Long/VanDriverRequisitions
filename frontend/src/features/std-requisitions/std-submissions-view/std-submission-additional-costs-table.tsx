"use client";

import {
    Table,
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,
} from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";

import {
    getStdChargeTypeLabel,
    STD_CHARGE_TYPE,
} from "../constants/std-charge-type.constants";
import type { StdAdditionalCostSnapshot } from "../types/std-requisition-submission.types";
import { SubmissionSectionCard } from "@/features/requisitions-shared/components/submission-section-card";

type Props = {
    rows: StdAdditionalCostSnapshot[];
};

export function StdSubmissionAdditionalCostsTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime() ||
            a.reasonName.localeCompare(b.reasonName),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            totalBags: acc.totalBags + row.numberOfBags,
            totalMiles:
                acc.totalMiles +
                (row.chargeType === STD_CHARGE_TYPE.Mileage ? row.miles ?? 0 : 0),
            subtotal: acc.subtotal + row.totalValue,
        }),
        {
            totalBags: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );

    return (
        <SubmissionSectionCard
            title="Additional Costs"
            description="Submitted additional standard van driver charges"
            summary={
                <>
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalBags} bags • {totals.totalMiles} miles •{" "}
                    {formatCurrencyGB(totals.subtotal)}
                </>
            }
        >
            <Table>
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell nowrap className="print-col-week">
                            Date
                        </TableHeaderCell>

                        <TableHeaderCell className="min-w-[220px]">
                            Reason
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Bags
                        </TableHeaderCell>

                        <TableHeaderCell nowrap>
                            Charge Type
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Miles
                        </TableHeaderCell>

                        <TableHeaderCell
                            align="right"
                            nowrap
                            className="print-col-rate"
                        >
                            Rate / Charge
                        </TableHeaderCell>

                        <TableHeaderCell
                            align="right"
                            nowrap
                            className="print-col-value"
                        >
                            Value
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {orderedRows.map((row, index) => (
                        <TableRow
                            key={`${row.date}-${row.reasonId}-${index}`}
                        >
                            <TableCell nowrap className="print-col-week">
                                {formatDateGB(row.date)}
                            </TableCell>

                            <TableCell>
                                <span className="font-medium">
                                    {row.reasonName}
                                </span>
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.numberOfBags}
                            </TableCell>

                            <TableCell>
                                {getStdChargeTypeLabel(row.chargeType)}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.chargeType === STD_CHARGE_TYPE.Mileage
                                    ? row.miles ?? "-"
                                    : "-"}
                            </TableCell>

                            <TableCell
                                align="right"
                                className="tabular-nums print-col-rate"
                            >
                                {row.chargeType === STD_CHARGE_TYPE.Mileage
                                    ? formatCurrencyGB(row.ratePerMile ?? 0)
                                    : formatCurrencyGB(row.flatCharge ?? 0)}
                            </TableCell>

                            <TableCell
                                align="right"
                                className="font-semibold tabular-nums print-col-value"
                            >
                                {formatCurrencyGB(row.totalValue)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell className="print-col-week">Totals</TableCell>

                        <TableCell />

                        <TableCell align="right" className="tabular-nums">
                            {totals.totalBags}
                        </TableCell>

                        <TableCell />

                        <TableCell align="right" className="tabular-nums">
                            {totals.totalMiles}
                        </TableCell>

                        <TableCell className="print-col-rate" />

                        <TableCell
                            align="right"
                            className="font-semibold tabular-nums print-col-value"
                        >
                            {formatCurrencyGB(totals.subtotal)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </SubmissionSectionCard>
    );
}