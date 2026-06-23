import Link from "next/link";

import { Surface } from "@/components/ui/surface";
import {
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableRow,
    TableCell,
    Table,
} from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";
import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import type { StdRequisitionSummary } from "../../types/std-requisition.types";
import type { StdRequisitionStatus } from "../../constants/std-requisition-status.constants";
import { StdStatusPill } from "./std-status-pill";

type Props = {
    items: StdRequisitionSummary[];
    getHref: (item: StdRequisitionSummary) => string;
    onRowClick: (item: StdRequisitionSummary) => void;
};

export function StdRequisitionTable({ items, getHref, onRowClick }: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full text-left">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Requisition</TableHeaderCell>
                        <TableHeaderCell>Company</TableHeaderCell>

                        <TableHeaderCell align="center" nowrap>
                            Status
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Amount
                        </TableHeaderCell>

                        <TableHeaderCell>Shop</TableHeaderCell>
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <tbody className="divide-y divide-border-subtle">
                    {items.map((req) => {
                        return (
                            <TableRow
                                key={req.id}
                                onClick={() => onRowClick(req)}
                                className="
                                    cursor-pointer
                                    transition-all
                                    hover:bg-surface-hover
                                    hover:shadow-sm
                                "
                            >
                                <TableCell>
                                    <Link
                                        href={getHref(req)}
                                        aria-label={`Open requisition ${req.requisitionNumber}`}
                                        className="
                                            inline-flex rounded-sm text-left
                                            focus-visible:outline-none
                                            focus-visible:ring-2
                                            focus-visible:ring-ring
                                            focus-visible:ring-offset-2
                                            focus-visible:ring-offset-surface
                                        "
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                    >
                                        <span className="flex flex-col leading-tight">
                                            <span className="font-semibold text-foreground">
                                                {req.requisitionNumber}
                                            </span>

                                            <span className="text-xs text-muted-foreground">
                                                {formatDateGB(req.requisitionDate)}
                                            </span>
                                        </span>
                                    </Link>
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-medium text-foreground">
                                            {req.vanDriverCode}
                                        </span>

                                        <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                                            {req.tradersName}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell align="center" nowrap>
                                    <div className="flex justify-center">
                                        <StdStatusPill status={req.status as StdRequisitionStatus} />
                                    </div>
                                </TableCell>

                                <TableCell
                                    align="right"
                                    nowrap
                                    className="font-semibold tabular-nums text-foreground"
                                >
                                    {formatCurrencyGB(req.subtotal)}
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-medium text-foreground">
                                            {req.shopCode}
                                        </span>

                                        <span className="max-w-[220px] truncate text-xs text-muted-foreground">
                                            {req.shopName}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <ActivityMetaCell
                                        date={req.updatedAtUtc ?? req.createdAtUtc}
                                        user={
                                            req.updatedByNameSnapshot ??
                                            req.createdByNameSnapshot
                                        }
                                        userClassName="max-w-[160px] truncate"
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </tbody>
            </Table>
        </Surface>
    );
}