"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import {
    TableHeader,
    TableHeaderCell,
    TableBody,
    TableCell,
    TableFooter,
    TableRow,
    TableHeaderRow,
} from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FeMileageDraft } from "../types/fe-mileage-draft";
import { FeMileageForm } from "../types/fe-mileage-form";
import { calculateFeMileageTotals } from "../lib/calculate-fe-mileage-totals";
import { mapFeMileageDraftToForm } from "../lib/map-fe-mileage-draft-to-form";
import { FeMileageDrawer } from "./fe-mileage-drawer";
import { getMileageLimitStatus } from "../lib/get-fe-mileage-limit-status";

type Props = {
    readonly: boolean;
    limitRule?: RequisitionLimitRuleSummary;
    rows: FeMileageDraft[];
    onAdd: (form: FeMileageForm) => void;
    onUpdate: (clientId: string, form: FeMileageForm) => void;
    onDelete: (clientId: string) => void;
};

export function FeMileageWorkspace({
    readonly,
    limitRule,
    rows,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<FeMileageDraft | null>(null);

    const totals = calculateFeMileageTotals(rows);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">Mileage</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage mileage entries
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totals.totalMiles} miles • {formatCurrencyGB(totals.subtotal)}
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingRow(null);
                            setOpen(true);
                        }}
                    >
                        <Plus size={14} />
                        Add Mileage
                    </Button>
                )}
            </div>

            {rows.length === 0 ? (
                <EmptyState title="No Mileage" />
            ) : (
                <MileageTable
                    readonly={readonly}
                    rows={rows}
                    limitRule={limitRule}
                    onEdit={(row) => {
                        setEditingRow(row);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}

            <FeMileageDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={editingRow ? "Edit Mileage" : "Add Mileage"}
                limitRule={limitRule}
                initialValues={editingRow ? mapFeMileageDraftToForm(editingRow) : undefined}
                onClose={() => {
                    setOpen(false);
                    setEditingRow(null);
                }}
                onSave={(form) => {
                    if (editingRow) {
                        onUpdate(editingRow.clientId, form);
                    } else {
                        onAdd(form);
                    }
                }}
            />
        </div>
    );
}

type TableProps = {
    readonly: boolean;
    limitRule?: RequisitionLimitRuleSummary;
    rows: FeMileageDraft[];
    onEdit: (row: FeMileageDraft) => void;
    onDelete: (clientId: string) => void;
};

function MileageTable({
    readonly,
    limitRule,
    rows,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    const totals = calculateFeMileageTotals(rows);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>
                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Week Ending
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Sun
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Mon
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Tue
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Wed
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Thu
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Fri
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="center">
                                Sat
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Total Miles
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Rate
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Total
                            </TableHeaderCell>

                            {!readonly && (
                                <TableHeaderCell
                                    className="sticky top-0 z-20 bg-surface-elevated"
                                    align="right"
                                    nowrap
                                >
                                    Actions
                                </TableHeaderCell>
                            )}
                        </TableHeaderRow>
                    </TableHeader>

                    <TableBody>
                        {rows.map((row) => {
                            const limitStatus = getMileageLimitStatus(row, limitRule);
                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";

                            return (
                                <TableRow
                                    key={row.clientId}
                                    className={hasLimitIssue ? "bg-warning/10" : undefined}
                                >
                                    <TableCell>
                                        <div>
                                            <div>
                                                {row.weekEndingDate
                                                    ? row.weekEndingDate.toLocaleDateString()
                                                    : "-"}
                                            </div>

                                            {hasLimitIssue && (
                                                <div className="mt-1 space-y-1">
                                                    <div className="text-xs font-medium text-warning">
                                                        {limitStatus.state === "missing-limit"
                                                            ? "Missing limit"
                                                            : "Exceeds limit"}
                                                    </div>

                                                    <ul className="list-disc pl-4 text-xs text-warning">
                                                        {limitStatus.messages.map((message) => (
                                                            <li key={message}>{message}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell align="center">{row.quantities.sunday ?? "-"}</TableCell>
                                    <TableCell align="center">{row.quantities.monday ?? "-"}</TableCell>
                                    <TableCell align="center">{row.quantities.tuesday ?? "-"}</TableCell>
                                    <TableCell align="center">{row.quantities.wednesday ?? "-"}</TableCell>
                                    <TableCell align="center">{row.quantities.thursday ?? "-"}</TableCell>
                                    <TableCell align="center">{row.quantities.friday ?? "-"}</TableCell>
                                    <TableCell align="center">{row.quantities.saturday ?? "-"}</TableCell>

                                    <TableCell align="right">{row.totalMiles}</TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {formatCurrencyGB(row.ratePerMile ?? 0)}
                                    </TableCell>

                                    <TableCell align="right" className="font-semibold tabular-nums">
                                        {formatCurrencyGB(row.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <div className="flex justify-end gap-2">
                                                <IconButton
                                                    variant="ghost"
                                                    tone="accent"
                                                    onClick={() => onEdit(row)}
                                                >
                                                    <Pencil size={14} />
                                                </IconButton>

                                                <IconButton
                                                    tone="danger"
                                                    variant="ghost"
                                                    onClick={() => onDelete(row.clientId)}
                                                >
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>

                    <TableFooter>
                        <TableRow>
                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated">
                                Totals
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.sunday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.monday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.tuesday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.wednesday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.thursday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.friday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="center">
                                {totals.saturday}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" align="right">
                                {totals.totalMiles}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated tabular-nums"
                                align="right"
                            >
                                {formatCurrencyGB(totals.subtotal)}
                            </TableCell>

                            {!readonly && (
                                <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />
                            )}
                        </TableRow>
                    </TableFooter>
                </table>
            </div>
        </div>
    );
}

