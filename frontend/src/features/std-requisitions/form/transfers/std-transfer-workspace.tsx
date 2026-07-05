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
import { formatDateGB } from "@/lib/format/date";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import { DeleteRowButton } from "@/features/requisitions-shared/components/delete-row-button";
import { EditableCellButton } from "@/features/requisitions-shared/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/requisitions-shared/lib/get-editable-table-row-class-name";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";
import { mapStdTransferDraftToForm } from "../lib/map-std-transfer-draft-to-form";
import { StdTransferDrawer } from "./std-transfer-drawer";
import { getStdChargeLimitStatus } from "../lib/get-std-charge-limit-status";
import { StdChargeTypeCell, StdMilesCell, StdRateChargeCell } from "../components/std-charge-table-cells";
import { RequisitionWorkspaceHeader } from "@/features/requisitions-shared/components/requisition-workspace-header";
import { RequisitionLimitWarningBlock } from "@/features/requisitions-shared/components/requisition-limit-warning-block";
import { InactiveLookupWarning } from "@/features/requisitions-shared/components/inactive-lookup-warning";
import { getRequisitionRowIssueSeverity } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

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
            <RequisitionWorkspaceHeader
                title="Transfers"
                description="Manage transfer entries between shops"
                summary={
                    <>
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totalBags} bags • {totalBoxes} boxes • {totalMiles} miles •{" "}
                        {formatCurrencyGB(subtotal)}
                    </>
                }
                actionLabel="Add Transfer"
                actionHidden={readonly}
                actionDisabled={!canAddRows}
                onAction={() => {
                    setEditingTransfer(null);
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
                <Table className="min-w-full">
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

                            const hasInactiveLookup =
                                transfer.isShopFromActive === false ||
                                transfer.isShopToActive === false;

                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";

                            const issueSeverity = getRequisitionRowIssueSeverity({
                                hasWarning: hasInactiveLookup,
                                hasBlocker: hasLimitIssue,
                            });

                            return (
                                <TableRow
                                    key={transfer.clientId}
                                    onClick={readonly ? undefined : () => onEdit(transfer)}
                                    className={getEditableTableRowClassName({
                                        readonly,
                                        issueSeverity,
                                    })}
                                >
                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit transfer row"
                                                onEdit={() => onEdit(transfer)}
                                            >
                                                {transfer.date ? formatDateGB(transfer.date) : "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <RequisitionLimitWarningBlock
                                                    status={limitStatus}
                                                    className="mt-1"
                                                />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                <span className="text-muted-foreground">From: </span>
                                                <span className="font-medium">{transfer.shopLabelFrom ?? "-"}</span>

                                                {transfer.isShopFromActive === false && (
                                                    <InactiveLookupWarning label="from shop" />
                                                )}
                                            </div>

                                            <div className="text-sm">
                                                <span className="text-muted-foreground">To: </span>
                                                <span className="font-medium">{transfer.shopLabelTo ?? "-"}</span>

                                                {transfer.isShopToActive === false && (
                                                    <InactiveLookupWarning label="to shop" />
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {transfer.numberOfBags ?? "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {transfer.numberOfBoxes ?? "-"}
                                    </TableCell>

                                    <StdChargeTypeCell row={transfer} />
                                    <StdMilesCell row={transfer} />
                                    <StdRateChargeCell row={transfer} />

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
                </Table>
            </div>
        </div>
    );
}