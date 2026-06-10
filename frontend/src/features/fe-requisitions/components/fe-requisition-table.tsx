import { Surface } from "@/components/ui/surface";
import { formatCurrencyGB } from "@/lib/format/currency";
import { TableCell, TableHeader, TableHeaderCell, TableHeaderRow, TableRow } from "../../../components/ui/table/table";
import { formatDateGB, formatDateTime } from "@/lib/format/date";
import { RequisitionStatus } from "../constants/fe-requisition-status.constants";
import { StatusPill } from "./status-pill";
import { FeRequisitionSummary } from "../types/fe-requisition.types";

type Props = {
    items: FeRequisitionSummary[];
    onRowClick: (item: FeRequisitionSummary) => void;
};

export function FeRequisitionTable({
    items,
    onRowClick,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Requisition</TableHeaderCell>
                        <TableHeaderCell>Company</TableHeaderCell>
                        <TableHeaderCell align="center"nowrap>Status</TableHeaderCell>
                        <TableHeaderCell align="right" nowrap>Amount</TableHeaderCell>
                        <TableHeaderCell>Shop</TableHeaderCell>
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <tbody className="divide-y divide-border-subtle">
                    {items.map((req) => {
                        const lastDate =
                            req.updatedAtUtc ?? req.createdAtUtc;

                        const lastUser =
                            req.updatedByNameSnapshot ??
                            req.createdByNameSnapshot ??
                            "System";

                        return (
                            <TableRow
                                key={req.id}
                                onClick={() => onRowClick(req)}
                                className="
                        cursor-pointer
                        hover:bg-surface-hover
                        hover:shadow-sm
                        transition-all
                    "
                            >
                                {/* Requisition */}
                                <TableCell>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-semibold text-foreground">
                                            {req.requisitionNumber}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {formatDateGB(req.requisitionDate)}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Company */}
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

                                {/* Status */}
                                <TableCell
                                    align="center"
                                    nowrap
                                >
                                    <div className="flex justify-center">
                                        <StatusPill
                                            status={req.status as RequisitionStatus}
                                        />
                                    </div>
                                </TableCell>

                                {/* Amount */}
                                <TableCell
                                    align="right"
                                    nowrap
                                    className="
                            font-semibold
                            tabular-nums
                            text-foreground
                        "
                                >
                                    {formatCurrencyGB(req.subtotal)}
                                </TableCell>

                                {/* Shop */}
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

                                {/* Last Modified */}
                                <TableCell>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateTime(lastDate) ?? "—"}
                                        </span>

                                        <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                                            {lastUser}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </tbody>
            </table>
        </Surface>
    );
}