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
    Table,
} from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FeTransferDraft } from "../types/fe-transfer-draft";
import { FeTransferForm } from "../types/fe-transfer-form";
import { calculateFeTransferTotals } from "../lib/calculate-fe-transfer-totals";
import { mapFeTransferDraftToForm } from "../lib/map-fe-transfer-draft-to-form";
import { FeTransferDrawer } from "./fe-transfer-drawer";
import { getEditableTableRowClassName } from "../../../requisitions-shared/lib/get-editable-table-row-class-name";
import { EditableCellButton } from "../../../requisitions-shared/components/editable-cell-button";
import { DeleteRowButton } from "../../../requisitions-shared/components/delete-row-button";

type Props = {
    readonly: boolean;
    limitRule?: RequisitionLimitRuleSummary;
    transfers: FeTransferDraft[];
    onAdd: (form: FeTransferForm) => void;
    onUpdate: (clientId: string, form: FeTransferForm) => void;
    onDelete: (clientId: string) => void;
};

export function FeTransferWorkspace({
    readonly,
    limitRule,
    transfers,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] = useState<FeTransferDraft | null>(null);

    const totals = calculateFeTransferTotals(transfers);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">Transfers</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage transfer entries between shops
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {transfers.length} entr{transfers.length === 1 ? "y" : "ies"} •{" "}
                        {totals.totalNumber} quantity • {formatCurrencyGB(totals.subtotal)}
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingTransfer(null);
                            setOpen(true);
                        }}
                    >
                        <Plus size={14} />
                        Add Transfer
                    </Button>
                )}
            </div>

            {transfers.length === 0 ? (
                <EmptyState title="No Transfers" />
            ) : (
                <TransfersTable
                    readonly={readonly}
                    limitRule={limitRule}
                    transfers={transfers}
                    onEdit={(transfer) => {
                        setEditingTransfer(transfer);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}

            <FeTransferDrawer
                key={editingTransfer ? editingTransfer.clientId : "new"}
                open={open}
                title={editingTransfer ? "Edit Transfer" : "Add Transfer"}
                limitRule={limitRule}
                initialValues={
                    editingTransfer ? mapFeTransferDraftToForm(editingTransfer) : undefined
                }
                onClose={() => {
                    setOpen(false);
                    setEditingTransfer(null);
                }}
                onSave={(form) => {
                    if (editingTransfer) {
                        onUpdate(editingTransfer.clientId, form);
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
    transfers: FeTransferDraft[];
    onEdit: (transfer: FeTransferDraft) => void;
    onDelete: (clientId: string) => void;
};

function TransfersTable({
    readonly,
    limitRule,
    transfers,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    const totals = calculateFeTransferTotals(transfers);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Week Ending
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated min-w-[260px]">
                                Transfer
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
                                Total Qty
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
                        {transfers.map((transfer) => {
                            const limitStatus = getTransferLimitStatus(transfer, limitRule);
                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";

                            return (
                                <TableRow
                                    key={transfer.clientId}
                                    onClick={readonly ? undefined : () => onEdit(transfer)}
                                    className={getEditableTableRowClassName({
                                        readonly,
                                        hasIssue: hasLimitIssue,
                                    })}
                                >
                                    <TableCell>
                                        {transfer.weekEndingDate ? transfer.weekEndingDate.toLocaleDateString() : "-"}
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit transfer row"
                                                onEdit={() => onEdit(transfer)}
                                                className="block w-full"
                                            >
                                                <span className="block text-sm">
                                                    <span className="text-muted-foreground">From: </span>
                                                    <span className="font-medium">{transfer.shopLabelFrom ?? "-"}</span>
                                                </span>

                                                <span className="block text-sm">
                                                    <span className="text-muted-foreground">To: </span>
                                                    <span className="font-medium">{transfer.shopLabelTo ?? "-"}</span>
                                                </span>
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="text-xs font-medium text-warning">
                                                        {limitStatus.state === "missing-limit" ? "Missing limit" : "Exceeds limit"}
                                                    </div>

                                                    <ul className="list-disc pl-4 text-xs text-warning">
                                                        {limitStatus.messages.map((message, index) => (
                                                            <li key={`${message}-${index}`}>{message}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell align="center">{transfer.quantities.sunday ?? "-"}</TableCell>
                                    <TableCell align="center">{transfer.quantities.monday ?? "-"}</TableCell>
                                    <TableCell align="center">{transfer.quantities.tuesday ?? "-"}</TableCell>
                                    <TableCell align="center">{transfer.quantities.wednesday ?? "-"}</TableCell>
                                    <TableCell align="center">{transfer.quantities.thursday ?? "-"}</TableCell>
                                    <TableCell align="center">{transfer.quantities.friday ?? "-"}</TableCell>
                                    <TableCell align="center">{transfer.quantities.saturday ?? "-"}</TableCell>

                                    <TableCell align="right">{transfer.totalNumber}</TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {formatCurrencyGB(transfer.ratePerJob ?? 0)}
                                    </TableCell>

                                    <TableCell align="right" className="font-semibold tabular-nums">
                                        {formatCurrencyGB(transfer.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <div className="flex justify-end gap-2">
                                                <DeleteRowButton
                                                    ariaLabel="Delete transfer row"
                                                    onDelete={() => onDelete(transfer.clientId)}
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
                                {totals.totalNumber}
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
                </Table>
            </div>
        </div>
    );
}

type TransferLimitStatus =
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

function getTransferLimitStatus(
    row: FeTransferDraft,
    limitRule?: RequisitionLimitRuleSummary,
): TransferLimitStatus {
    if (!limitRule) {
        return {
            state: "missing-limit",
            messages: ["No transfer limit rule is configured."],
        };
    }

    const messages: string[] = [];

    const dailyValues = [
        ["Sunday", row.quantities.sunday],
        ["Monday", row.quantities.monday],
        ["Tuesday", row.quantities.tuesday],
        ["Wednesday", row.quantities.wednesday],
        ["Thursday", row.quantities.thursday],
        ["Friday", row.quantities.friday],
        ["Saturday", row.quantities.saturday],
    ] as const;

    for (const [day, value] of dailyValues) {
        if ((value ?? 0) > limitRule.maxQuantity) {
            messages.push(`${day} exceeds max quantity of ${limitRule.maxQuantity}.`);
        }
    }

    if ((row.ratePerJob ?? 0) > limitRule.maxRate) {
        messages.push(`Rate exceeds maximum of ${formatCurrencyGB(limitRule.maxRate)}.`);
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