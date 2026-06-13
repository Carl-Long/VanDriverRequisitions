"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button/button";
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

import { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { calculateFeAdditionalCostTotals } from "../lib/calculate-fe-additional-cost-totals";
import { mapFeAdditionalCostDraftToForm } from "../lib/map-fe-additional-cost-draft-to-form";
import { FeAdditionalCostDrawer } from "./fe-additional-cost-drawer";
import { getEditableTableRowClassName } from "../lib/get-editable-table-row-class-name";
import { EditableCellButton } from "../components/editable-cell-button";
import { DeleteRowButton } from "../components/delete-row-button";

type Props = {
    readonly: boolean;
    additionalCostLimitRule?: RequisitionLimitRuleSummary;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    rows: FeAdditionalCostDraft[];
    onAdd: (form: FeAdditionalCostForm) => void;
    onUpdate: (clientId: string, form: FeAdditionalCostForm) => void;
    onDelete: (clientId: string) => void;
};

export function FeAdditionalCostWorkspace({
    readonly,
    additionalCostLimitRule,
    mileageLimitRule,
    rows,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<FeAdditionalCostDraft | null>(null);

    const totals = calculateFeAdditionalCostTotals(rows);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">Additional Costs</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage additional job and mileage costs
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totals.totalJobQuantity} job qty • {totals.totalMiles} miles •{" "}
                        {formatCurrencyGB(totals.subtotal)}
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
                        Add Additional Cost
                    </Button>
                )}
            </div>

            {rows.length === 0 ? (
                <EmptyState title="No Additional Costs" />
            ) : (
                <AdditionalCostsTable
                    readonly={readonly}
                    rows={rows}
                    additionalCostLimitRule={additionalCostLimitRule}
                    mileageLimitRule={mileageLimitRule}
                    onEdit={(row) => {
                        setEditingRow(row);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}

            <FeAdditionalCostDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={editingRow ? "Edit Additional Cost" : "Add Additional Cost"}
                additionalCostLimitRule={additionalCostLimitRule}
                mileageLimitRule={mileageLimitRule}
                initialValues={editingRow ? mapFeAdditionalCostDraftToForm(editingRow) : undefined}
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
    rows: FeAdditionalCostDraft[];
    additionalCostLimitRule?: RequisitionLimitRuleSummary;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    onEdit: (row: FeAdditionalCostDraft) => void;
    onDelete: (clientId: string) => void;
};

function AdditionalCostsTable({
    readonly,
    rows,
    additionalCostLimitRule,
    mileageLimitRule,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    const totals = calculateFeAdditionalCostTotals(rows);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Week Ending
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated min-w-[220px]">
                                Reason
                            </TableHeaderCell>


                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Type
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Qty / Miles
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
                                    Delete
                                </TableHeaderCell>
                            )}
                        </TableHeaderRow>
                    </TableHeader>

                    <TableBody>
                        {rows.map((row) => {
                            const limitStatus = getAdditionalCostLimitStatus(
                                row,
                                additionalCostLimitRule,
                                mileageLimitRule,
                            );

                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";

                            return (
                                <TableRow
                                    key={row.clientId}
                                    onClick={readonly ? undefined : () => onEdit(row)}
                                    className={getEditableTableRowClassName({
                                        readonly,
                                        hasIssue: hasLimitIssue,
                                    })}
                                >
                                    <TableCell>
                                        {row.weekEndingDate ? row.weekEndingDate.toLocaleDateString() : "-"}
                                    </TableCell>

                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit additional cost row"
                                                onEdit={() => onEdit(row)}
                                                className="font-medium"
                                            >
                                                {row.reasonText ?? "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <div className="mt-2 space-y-1">
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

                                    <TableCell>{row.chargingOption}</TableCell>

                                    <TableCell align="right">
                                        {row.chargingOption === "Mileage" ? `${row.miles ?? 0} mi` : row.totalNumber ?? 0}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {formatCurrencyGB(
                                            row.chargingOption === "Mileage"
                                                ? row.ratePerMile ?? 0
                                                : row.ratePerJob ?? 0,
                                        )}
                                    </TableCell>

                                    <TableCell align="right" className="font-semibold tabular-nums">
                                        {formatCurrencyGB(row.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <div className="flex justify-end gap-2">
                                                <DeleteRowButton
                                                    ariaLabel="Delete additional cost row"
                                                    onDelete={() => onDelete(row.clientId)}
                                                />
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

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                {totals.totalJobQuantity} jobs / {totals.totalMiles} mi
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

type AdditionalCostLimitStatus =
    | {
        state: "ok";
        messages: string[];
    }
    | {
        state: "missing-limit";
        messages: string[];
    }
    | {
        state: "exceeds-limit";
        messages: string[];
    };

function getAdditionalCostLimitStatus(
    row: FeAdditionalCostDraft,
    additionalCostLimitRule?: RequisitionLimitRuleSummary,
    mileageLimitRule?: RequisitionLimitRuleSummary,
): AdditionalCostLimitStatus {
    const rule = row.chargingOption === "Mileage" ? mileageLimitRule : additionalCostLimitRule;

    if (!rule) {
        return {
            state: "missing-limit",
            messages: [
                row.chargingOption === "Mileage"
                    ? "No mileage limit rule is configured."
                    : "No additional cost limit rule is configured.",
            ],
        };
    }

    const messages: string[] = [];

    if (row.chargingOption === "Mileage") {
        if ((row.miles ?? 0) > rule.maxQuantity) {
            messages.push(`Miles exceed maximum of ${rule.maxQuantity}.`);
        }

        if ((row.ratePerMile ?? 0) > rule.maxRate) {
            messages.push(`Rate exceeds maximum of ${formatCurrencyGB(rule.maxRate)}.`);
        }
    } else {
        if ((row.totalNumber ?? 0) > rule.maxQuantity) {
            messages.push(`Quantity exceeds maximum of ${rule.maxQuantity}.`);
        }

        if ((row.ratePerJob ?? 0) > rule.maxRate) {
            messages.push(`Rate exceeds maximum of ${formatCurrencyGB(rule.maxRate)}.`);
        }
    }

    if (messages.length === 0) {
        return {
            state: "ok",
            messages: [],
        };
    }

    return {
        state: "exceeds-limit",
        messages,
    };
}