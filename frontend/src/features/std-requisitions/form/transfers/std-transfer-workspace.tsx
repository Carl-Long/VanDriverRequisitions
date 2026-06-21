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
import { formatDateGB } from "@/lib/format/date";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import { DeleteRowButton } from "@/features/requisitions-shared/components/delete-row-button";
import { EditableCellButton } from "@/features/requisitions-shared/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/requisitions-shared/lib/get-editable-table-row-class-name";

import {
    getStdChargeTypeLabel,
    STD_CHARGE_TYPE,
} from "../../constants/std-charge-type.constants";
import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";
import { mapStdTransferDraftToForm } from "../lib/map-std-transfer-draft-to-form";
import { StdTransferDrawer } from "./std-transfer-drawer";
import { getStdChargeLimitStatus } from "../lib/get-std-charge-limit-status";

type Props = {
    readonly: boolean;
    rows: StdTransferDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    onAdd: (form: StdTransferForm) => void;
    onUpdate: (clientId: string, form: StdTransferForm) => void;
    onDelete: (clientId: string) => void;
};

export function StdTransferWorkspace({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingTransfer, setEditingTransfer] =
        useState<StdTransferDraft | null>(null);

    const subtotal = rows.reduce((total, row) => total + row.totalValue, 0);

    const totalBags = rows.reduce(
        (total, row) => total + (row.numberOfBags ?? 0),
        0,
    );

    const totalBoxes = rows.reduce(
        (total, row) => total + (row.numberOfBoxes ?? 0),
        0,
    );

    const totalMiles = rows.reduce(
        (total, row) =>
            total +
            (row.chargeType === STD_CHARGE_TYPE.Mileage ? row.miles ?? 0 : 0),
        0,
    );

    const canAddRows = !!mileageLimitRule || !!flatChargeLimitRule;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">Transfers</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage transfer entries between shops
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totalBags} bags • {totalBoxes} boxes • {totalMiles} miles •{" "}
                        {formatCurrencyGB(subtotal)}
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        disabled={!canAddRows}
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

            {!canAddRows && !readonly && (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                    No STD mileage or flat charge limit rules are configured. Rows
                    cannot be added until at least one charge rule is configured.
                </div>
            )}

            {rows.length === 0 ? (
                <EmptyState title="No Transfers" />
            ) : (
                <TransfersTable
                    readonly={readonly}
                    rows={rows}
                    mileageLimitRule={mileageLimitRule}
                    flatChargeLimitRule={flatChargeLimitRule}
                    totalBags={totalBags}
                    totalBoxes={totalBoxes}
                    totalMiles={totalMiles}
                    subtotal={subtotal}
                    onEdit={(transfer) => {
                        setEditingTransfer(transfer);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}

            <StdTransferDrawer
                key={editingTransfer ? editingTransfer.clientId : "new"}
                open={open}
                title={editingTransfer ? "Edit Transfer" : "Add Transfer"}
                mileageLimitRule={mileageLimitRule}
                flatChargeLimitRule={flatChargeLimitRule}
                initialValues={
                    editingTransfer
                        ? mapStdTransferDraftToForm(editingTransfer)
                        : undefined
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
    rows: StdTransferDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    totalBags: number;
    totalBoxes: number;
    totalMiles: number;
    subtotal: number;
    onEdit: (transfer: StdTransferDraft) => void;
    onDelete: (clientId: string) => void;
};

function TransfersTable({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    totalBags,
    totalBoxes,
    totalMiles,
    subtotal,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>
                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Date
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated min-w-[260px]">
                                Transfer
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Bags
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Boxes
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Charge Type
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Miles
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Rate / Charge
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
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
                        {rows.map((transfer) => {
                            const limitStatus = getStdChargeLimitStatus(
                                transfer,
                                mileageLimitRule,
                                flatChargeLimitRule,
                            );

                            const hasLimitIssue =
                                !readonly && limitStatus.state !== "ok";

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
                                        {transfer.date
                                            ? formatDateGB(transfer.date)
                                            : "-"}
                                        {hasLimitIssue && (
                                            <div className="mt-2 space-y-1">
                                                <div className="text-xs font-medium text-warning">
                                                    {limitStatus.state === "missing-limit"
                                                        ? "Missing limit"
                                                        : "Exceeds limit"}
                                                </div>

                                                <ul className="list-disc pl-4 text-xs text-warning">
                                                    {limitStatus.messages.map(
                                                        (message) => (
                                                            <li key={message}>
                                                                {message}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
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
                                                    <span className="text-muted-foreground">
                                                        From:{" "}
                                                    </span>
                                                    <span className="font-medium">
                                                        {transfer.shopLabelFrom ?? "-"}
                                                    </span>
                                                </span>

                                                <span className="block text-sm">
                                                    <span className="text-muted-foreground">
                                                        To:{" "}
                                                    </span>
                                                    <span className="font-medium">
                                                        {transfer.shopLabelTo ?? "-"}
                                                    </span>
                                                </span>
                                            </EditableCellButton>

                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {transfer.numberOfBags ?? "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {transfer.numberOfBoxes ?? "-"}
                                    </TableCell>

                                    <TableCell>
                                        {getStdChargeTypeLabel(transfer.chargeType)}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {transfer.chargeType === STD_CHARGE_TYPE.Mileage
                                            ? transfer.miles ?? "-"
                                            : "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {transfer.chargeType === STD_CHARGE_TYPE.Mileage
                                            ? formatCurrencyGB(
                                                transfer.ratePerMile ?? 0,
                                            )
                                            : formatCurrencyGB(
                                                transfer.flatCharge ?? 0,
                                            )}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        className="font-semibold tabular-nums"
                                    >
                                        {formatCurrencyGB(transfer.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <div className="flex justify-end gap-2">
                                                <DeleteRowButton
                                                    ariaLabel="Delete transfer row"
                                                    onDelete={() =>
                                                        onDelete(transfer.clientId)
                                                    }
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

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated tabular-nums"
                                align="right"
                            >
                                {totalBags}
                            </TableCell>

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated tabular-nums"
                                align="right"
                            >
                                {totalBoxes}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated tabular-nums"
                                align="right"
                            >
                                {totalMiles}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated tabular-nums"
                                align="right"
                            >
                                {formatCurrencyGB(subtotal)}
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