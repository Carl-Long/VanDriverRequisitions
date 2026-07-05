"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
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
import { DeleteRowButton } from "@/features/requisitions-shared/components/delete-row-button";
import { EditableCellButton } from "@/features/requisitions-shared/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/requisitions-shared/lib/get-editable-table-row-class-name";
import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";
import { mapStdPickupDraftToForm } from "../lib/map-std-pickup-draft-to-form";
import { StdPickupDrawer } from "./std-pickup-drawer";
import { getStdChargeLimitStatus } from "../lib/get-std-charge-limit-status";
import { StdChargeTypeCell, StdMilesCell, StdRateChargeCell } from "../components/std-charge-table-cells";
import { formatDateGB } from "@/lib/format/date";
import { RequisitionWorkspaceHeader } from "@/features/requisitions-shared/components/requisition-workspace-header";
import { RequisitionLimitWarningBlock } from "@/features/requisitions-shared/components/requisition-limit-warning-block";
import { getRequisitionRowIssueSeverity } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

type Props = {
    readonly: boolean;
    rows: StdPickupDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    onAdd: (form: StdPickupForm) => void;
    onUpdate: (clientId: string, form: StdPickupForm) => void;
    onDelete: (clientId: string) => void;
};

export function StdPickupWorkspace({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<StdPickupDraft | null>(null);

    const subtotal = rows.reduce((total, row) => total + row.totalValue, 0);

    const totalBags = rows.reduce(
        (total, row) => total + (row.numberOfBags ?? 0),
        0,
    );

    const totalHouseholds = rows.reduce(
        (total, row) => total + (row.numberOfHouseholds ?? 0),
        0,
    );

    const totalMiles = rows.reduce(
        (total, row) =>
            total + (row.chargeType === "Mileage" ? row.miles ?? 0 : 0),
        0,
    );

    const canAddRows = !!mileageLimitRule || !!flatChargeLimitRule;

    function openEditDrawer(row: StdPickupDraft) {
        if (readonly) {
            return;
        }

        setEditingRow(row);
        setOpen(true);
    }

    function saveRow(form: StdPickupForm) {
        if (editingRow) {
            onUpdate(editingRow.clientId, form);
        } else {
            onAdd(form);
        }
    }

    return (
        <div className="space-y-6">
            <RequisitionWorkspaceHeader
                title="Pickup Collections"
                description="Manage pickup collection entries"
                summary={
                    <>
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totalBags} bags • {totalHouseholds} households •{" "}
                        {totalMiles} miles • {formatCurrencyGB(subtotal)}
                    </>
                }
                actionLabel="Add Pickup"
                actionHidden={readonly}
                actionDisabled={!canAddRows}
                onAction={() => {
                    setEditingRow(null);
                    setOpen(true);
                }}
            />

            {!canAddRows && !readonly && (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                    No STD mileage or flat charge limit rules are configured. Rows
                    cannot be added until at least one charge rule is configured.
                </div>
            )}

            {rows.length === 0 ? (
                <EmptyState title="No Pickup Collections" />
            ) : (
                <PickupTable
                    readonly={readonly}
                    rows={rows}
                    mileageLimitRule={mileageLimitRule}
                    flatChargeLimitRule={flatChargeLimitRule}
                    totalBags={totalBags}
                    totalHouseholds={totalHouseholds}
                    totalMiles={totalMiles}
                    subtotal={subtotal}
                    onEdit={openEditDrawer}
                    onDelete={onDelete}
                />
            )}

            <StdPickupDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={editingRow ? "Edit Pickup" : "Add Pickup"}
                mileageLimitRule={mileageLimitRule}
                flatChargeLimitRule={flatChargeLimitRule}
                initialValues={
                    editingRow ? mapStdPickupDraftToForm(editingRow) : undefined
                }
                onClose={() => {
                    setOpen(false);
                    setEditingRow(null);
                }}
                onSave={saveRow}
            />
        </div>
    );
}

type TableProps = {
    readonly: boolean;
    rows: StdPickupDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    totalBags: number;
    totalHouseholds: number;
    totalMiles: number;
    subtotal: number;
    onEdit: (row: StdPickupDraft) => void;
    onDelete: (clientId: string) => void;
};

function PickupTable({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    totalBags,
    totalHouseholds,
    totalMiles,
    subtotal,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>
                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Date
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
                                Households
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
                        {rows.map((row) => {
                            const limitStatus = getStdChargeLimitStatus(
                                row,
                                mileageLimitRule,
                                flatChargeLimitRule,
                            );

                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";

                            const issueSeverity = getRequisitionRowIssueSeverity({
                                hasBlocker: hasLimitIssue,
                            });

                            return (
                                <TableRow
                                    key={row.clientId}
                                    onClick={readonly ? undefined : () => onEdit(row)}
                                    className={getEditableTableRowClassName({
                                        readonly,
                                        issueSeverity,
                                    })}
                                >
                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit pickup row"
                                                onEdit={() => onEdit(row)}
                                            >
                                                {formatDateGB(row.date) ?? "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <RequisitionLimitWarningBlock
                                                    status={limitStatus}
                                                    className="mt-1"
                                                />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfBags ?? "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfHouseholds ?? "-"}
                                    </TableCell>

                                    <StdChargeTypeCell row={row} />
                                    <StdMilesCell row={row} />
                                    <StdRateChargeCell row={row} />

                                    <TableCell align="right" className="font-semibold tabular-nums">
                                        {formatCurrencyGB(row.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right">
                                            <DeleteRowButton
                                                ariaLabel="Delete pickup row"
                                                onDelete={() => onDelete(row.clientId)}
                                            />
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>

                    <TableFooter>
                        <TableRow className="bg-surface-elevated font-semibold">
                            <TableCell>Totals</TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {totalBags}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {totalHouseholds}
                            </TableCell>

                            <TableCell />

                            <TableCell align="right" className="tabular-nums">
                                {totalMiles}
                            </TableCell>

                            <TableCell />

                            <TableCell align="right" className="tabular-nums">
                                {formatCurrencyGB(subtotal)}
                            </TableCell>

                            {!readonly && <TableCell />}
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
}