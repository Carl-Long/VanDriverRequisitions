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
import type { StdCollectionVanPackSnapshot } from "../types/std-requisition-submission.types";
import { SubmissionSectionCard } from "@/features/requisitions-shared/components/submission-section-card";

type Props = {
    rows: StdCollectionVanPackSnapshot[];
};

export function StdSubmissionVanPacksTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) =>
            new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime() ||
            a.postCodeZone.localeCompare(b.postCodeZone),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            totalVanPacksOut: acc.totalVanPacksOut + row.vanPacksOut,
            totalFilledBags: acc.totalFilledBags + row.filledBags,
            totalUnusedVanPacks: acc.totalUnusedVanPacks + row.unusedVanPacks,
            subtotal: acc.subtotal + row.totalValue,
        }),
        {
            totalVanPacksOut: 0,
            totalFilledBags: 0,
            totalUnusedVanPacks: 0,
            subtotal: 0,
        },
    );

    return (
        <SubmissionSectionCard
            title="Van Pack Collections"
            description="Submitted van pack collection charges"
            summary={
                <>
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalVanPacksOut} van packs out •{" "}
                    {totals.totalFilledBags} filled bags •{" "}
                    {formatCurrencyGB(totals.subtotal)}
                </>
            }
        >

            <Table>
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell nowrap className="print-col-week">
                            Delivery Date
                        </TableHeaderCell>

                        <TableHeaderCell nowrap>
                            Postcode Zone
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Van Packs Out
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Filled Bags
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Unused
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Returned
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap className="print-col-rate">
                            Fixed Price
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap className="print-col-value">
                            Value
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {orderedRows.map((row, index) => (
                        <TableRow key={`${row.deliveryDate}-${row.postCodeZone}-${index}`}>
                            <TableCell nowrap className="print-col-week">
                                {formatDateGB(row.deliveryDate)}
                            </TableCell>

                            <TableCell>
                                <span className="font-medium">
                                    {row.postCodeZone}
                                </span>
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.vanPacksOut}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.filledBags}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.unusedVanPacks}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.percentReturned.toFixed(2)}%
                            </TableCell>

                            <TableCell align="right" className="tabular-nums print-col-rate">
                                {formatCurrencyGB(row.ratePerVanPack)}
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
                            {totals.totalVanPacksOut}
                        </TableCell>

                        <TableCell align="right" className="tabular-nums">
                            {totals.totalFilledBags}
                        </TableCell>

                        <TableCell align="right" className="tabular-nums">
                            {totals.totalUnusedVanPacks}
                        </TableCell>

                        <TableCell />

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