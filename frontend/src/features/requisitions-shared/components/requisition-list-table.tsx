import Link from "next/link";

import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { Surface } from "@/components/ui/surface";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableHeaderRow,
    TableRow,
} from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";

import type { RequisitionStatus } from "../constants/requisition-status.constants";
import { RequisitionStatusPill } from "./requisition-status-pill";
import { VanDriverIdentityCell } from "./van-driver-identity-cell";

export type RequisitionListTableItem = {
    id: string;
    requisitionNumber: string;
    requisitionDate: string;

    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;

    shopCode: string;
    shopName: string;

    status: string;
    subtotal: number;

    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

type Props<TItem extends RequisitionListTableItem> = {
    items: TItem[];
    getHref: (item: TItem) => string;
    onRowClick: (item: TItem) => void;
};

export function RequisitionListTable<TItem extends RequisitionListTableItem>({
    items,
    getHref,
    onRowClick,
}: Readonly<Props<TItem>>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full text-left">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Requisition</TableHeaderCell>
                        <TableHeaderCell>Van Driver</TableHeaderCell>

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

                <TableBody>
                    {items.map((req) => (
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
                                <VanDriverIdentityCell
                                    vanDriverName={req.vanDriverName}
                                    vanDriverCode={req.vanDriverCode}
                                    tradersName={req.tradersName}
                                />
                            </TableCell>

                            <TableCell align="center" nowrap>
                                <div className="flex justify-center">
                                    <RequisitionStatusPill
                                        status={req.status as RequisitionStatus}
                                    />
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
                    ))}
                </TableBody>
            </Table>
        </Surface>
    );
}