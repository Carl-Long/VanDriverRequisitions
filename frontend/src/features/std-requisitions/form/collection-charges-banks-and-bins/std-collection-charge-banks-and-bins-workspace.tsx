"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableHeaderCell, TableHeaderRow, TableRow, } from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionChargeBanksAndBinsRowsTotal } from "../lib/calculate-std-collection-charge-banks-and-bins-form";
import { mapStdCollectionChargeBanksAndBinsDraftToForm } from "../lib/map-std-collection-charge-banks-and-bins-draft-to-form";
import { StdCollectionChargeBanksAndBinsDrawer } from "./std-collection-charge-banks-and-bins-drawer";
import { DeleteRowButton } from "@/features/requisitions-shared/components/delete-row-button";
import { EditableCellButton } from "@/features/requisitions-shared/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/requisitions-shared/lib/get-editable-table-row-class-name";
import { Alert } from "@/components/ui/alert";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { cn } from "@/lib/utils";
import { getStdChargeLimitStatus } from "../lib/get-std-charge-limit-status";
import { StdChargeTypeCell, StdMilesCell, StdRateChargeCell } from "../components/std-charge-table-cells";
import { StdLimitWarningBlock } from "../components/std-limit-warning-block";
import { formatDateGB } from "@/lib/format/date";
import { InactiveLookupWarning } from "@/features/requisitions-shared/components/inactive-lookup-warning";
import { RequisitionWorkspaceHeader } from "@/features/requisitions-shared/components/requisition-workspace-header";

type Props = {
    readonly: boolean;
    shopId: string | null;
    rows: StdCollectionChargeBanksAndBinsDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    onAdd: (form: StdCollectionChargeBanksAndBinsForm) => void;
    onUpdate: (clientId: string, form: StdCollectionChargeBanksAndBinsForm) => void;
    onDelete: (clientId: string) => void;
};

export function StdCollectionChargeBanksAndBinsWorkspace({
    readonly,
    shopId,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<StdCollectionChargeBanksAndBinsDraft | null>(
        null,
    );

    const subtotal = calculateStdCollectionChargeBanksAndBinsRowsTotal(rows);

    function openEditDrawer(row: StdCollectionChargeBanksAndBinsDraft) {
        if (readonly) {
            return;
        }

        setEditingRow(row);
        setOpen(true);
    }

    return (
        <div className="space-y-6">
            <RequisitionWorkspaceHeader
                title="Banks & Bins Collection Charges"
                description="Manage collection charges for banks and bins."
                summary={
                    <>
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {formatCurrencyGB(subtotal)}
                    </>
                }
                actionLabel="Add Collection Charge"
                actionHidden={readonly}
                actionDisabled={!shopId}
                onAction={() => {
                    setEditingRow(null);
                    setOpen(true);
                }}
            />

            {!shopId && !readonly && (
                <Alert tone="warning">
                    Select a shop on the Details tab before adding Banks & Bins rows.
                </Alert>
            )}

            {rows.length === 0 ? (
                <EmptyState title="No Banks & Bins rows" />
            ) : (
                <BanksAndBinsTable
                    readonly={readonly}
                    rows={rows}
                    mileageLimitRule={mileageLimitRule}
                    flatChargeLimitRule={flatChargeLimitRule}
                    onEdit={openEditDrawer}
                    onDelete={onDelete}
                />
            )}

            <StdCollectionChargeBanksAndBinsDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={editingRow ? "Edit Banks & Bins Row" : "Add Banks & Bins Row"}
                shopId={shopId}
                mileageLimitRule={mileageLimitRule}
                flatChargeLimitRule={flatChargeLimitRule}
                initialValues={
                    editingRow
                        ? mapStdCollectionChargeBanksAndBinsDraftToForm(editingRow)
                        : undefined
                }
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
    rows: StdCollectionChargeBanksAndBinsDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    onEdit: (row: StdCollectionChargeBanksAndBinsDraft) => void;
    onDelete: (clientId: string) => void;
};

function BanksAndBinsTable({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    const subtotal = calculateStdCollectionChargeBanksAndBinsRowsTotal(rows);

    const totalBags = rows.reduce((total, row) => total + (row.numberOfBags ?? 0), 0);

    const totalMiles = rows.reduce((total, row) => {
        return row.chargeType === STD_CHARGE_TYPE.Mileage ? total + (row.miles ?? 0) : total;
    }, 0);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>
                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Date
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 min-w-[180px] bg-surface-elevated">
                                Collection Type
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 min-w-[220px] bg-surface-elevated">
                                Location
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                                nowrap
                            >
                                Bags
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                nowrap
                            >
                                Charge Type
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                                nowrap
                            >
                                Miles
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                                nowrap
                            >
                                Rate / Charge
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                                nowrap
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
                            const hasInactiveLookup = row.isCollectionTypeActive === false || row.isLocationActive === false;
                            const hasIssue = hasLimitIssue || hasInactiveLookup;

                            return (
                                <TableRow
                                    key={row.clientId}
                                    onClick={readonly ? undefined : () => onEdit(row)}
                                    className={cn(
                                        getEditableTableRowClassName({ readonly, hasIssue }),
                                        hasIssue && "bg-warning-surface/40 hover:bg-warning-surface/60",
                                    )}
                                >
                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit Banks & Bins row"
                                                onEdit={() => onEdit(row)}
                                            >
                                                {formatDateGB(row.date) ?? "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <StdLimitWarningBlock
                                                    status={limitStatus}
                                                    className="mt-1"
                                                />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <EditableCellButton
                                            readonly={readonly}
                                            ariaLabel="Edit Banks & Bins row"
                                            onEdit={() => onEdit(row)}
                                            className="text-left"
                                        >
                                            <span className="flex flex-col leading-tight">
                                                <span className="font-medium">
                                                    {row.collectionTypeLabel ?? "-"}
                                                </span>

                                                {row.collectionTypeCode && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {row.collectionTypeCode}
                                                    </span>
                                                )}
                                                {row.isCollectionTypeActive === false && (
                                                    <InactiveLookupWarning label="collection type" />
                                                )}
                                            </span>
                                        </EditableCellButton>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium">
                                                {row.locationLabel ?? "-"}
                                            </span>

                                            {row.locationPostCode && (
                                                <span className="text-xs text-muted-foreground">
                                                    {row.locationPostCode}
                                                </span>
                                            )}

                                            {row.isLocationActive === false && (
                                                <InactiveLookupWarning label="location" />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfBags ?? "-"}
                                    </TableCell>

                                    <StdChargeTypeCell row={row} />
                                    <StdMilesCell row={row} />
                                    <StdRateChargeCell row={row} />

                                    <TableCell align="right" className="font-semibold tabular-nums">
                                        {formatCurrencyGB(row.totalValue ?? 0)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <DeleteRowButton
                                                ariaLabel="Delete Banks & Bins row"
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

                            <TableCell />
                            <TableCell />

                            <TableCell align="right" className="tabular-nums">
                                {totalBags}
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