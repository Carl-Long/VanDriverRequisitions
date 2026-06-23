"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button/button";
import { TableHeader, TableHeaderCell, TableBody, TableCell, TableFooter, TableRow, TableHeaderRow, Table, } from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { DeleteRowButton } from "@/features/requisitions-shared/components/delete-row-button";
import { EditableCellButton } from "@/features/requisitions-shared/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/requisitions-shared/lib/get-editable-table-row-class-name";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { mapStdAdditionalCostDraftToForm } from "../lib/map-std-additional-cost-draft-to-form";
import { StdAdditionalCostDrawer } from "./std-additional-cost-drawer";
import { getStdChargeLimitStatus } from "../lib/get-std-charge-limit-status";
import { StdLimitWarningBlock } from "../components/std-limit-warning-block";
import { StdChargeTypeCell, StdMilesCell, StdRateChargeCell } from "../components/std-charge-table-cells";


type Props = {
    readonly: boolean;
    rows: StdAdditionalCostDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    onAdd: (form: StdAdditionalCostForm) => void;
    onUpdate: (clientId: string, form: StdAdditionalCostForm) => void;
    onDelete: (clientId: string) => void;
};

export function StdAdditionalCostWorkspace({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] =
        useState<StdAdditionalCostDraft | null>(null);

    const subtotal = rows.reduce((total, row) => total + row.totalValue, 0);

    const totalBags = rows.reduce(
        (total, row) => total + (row.numberOfBags ?? 0),
        0,
    );

    const totalMiles = rows.reduce(
        (total, row) =>
            total +
            (row.chargeType === STD_CHARGE_TYPE.Mileage ? row.miles ?? 0 : 0),
        0,
    );

    const canAddRows = !!mileageLimitRule || !!flatChargeLimitRule;

    function openEditDrawer(row: StdAdditionalCostDraft) {
        if (readonly) {
            return;
        }

        setEditingRow(row);
        setOpen(true);
    }

    function saveRow(form: StdAdditionalCostForm) {
        if (editingRow) {
            onUpdate(editingRow.clientId, form);
        } else {
            onAdd(form);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">Additional Costs</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage additional standard van driver charges
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totalBags} bags • {totalMiles} miles •{" "}
                        {formatCurrencyGB(subtotal)}
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        disabled={!canAddRows}
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

            {!canAddRows && !readonly && (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                    No STD mileage or flat charge limit rules are configured. Rows
                    cannot be added until at least one charge rule is configured.
                </div>
            )}

            {rows.length === 0 ? (
                <EmptyState title="No Additional Costs" />
            ) : (
                <AdditionalCostsTable
                    readonly={readonly}
                    rows={rows}
                    mileageLimitRule={mileageLimitRule}
                    flatChargeLimitRule={flatChargeLimitRule}
                    totalBags={totalBags}
                    totalMiles={totalMiles}
                    subtotal={subtotal}
                    onEdit={openEditDrawer}
                    onDelete={onDelete}
                />
            )}

            <StdAdditionalCostDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={editingRow ? "Edit Additional Cost" : "Add Additional Cost"}
                mileageLimitRule={mileageLimitRule}
                flatChargeLimitRule={flatChargeLimitRule}
                initialValues={
                    editingRow
                        ? mapStdAdditionalCostDraftToForm(editingRow)
                        : undefined
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
    rows: StdAdditionalCostDraft[];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    totalBags: number;
    totalMiles: number;
    subtotal: number;
    onEdit: (row: StdAdditionalCostDraft) => void;
    onDelete: (clientId: string) => void;
};

function AdditionalCostsTable({
    readonly,
    rows,
    mileageLimitRule,
    flatChargeLimitRule,
    totalBags,
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

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated min-w-[220px]">
                                Reason
                            </TableHeaderCell>

                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Bags
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

                            const hasLimitIssue =
                                !readonly && limitStatus.state !== "ok";

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
                                        {row.date ? formatDateGB(row.date) : "-"}
                                        {hasLimitIssue && (
                                            <StdLimitWarningBlock
                                                status={limitStatus}
                                                className="mt-1"
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit additional cost row"
                                                onEdit={() => onEdit(row)}
                                            >
                                                {row.reasonCode && row.reasonText
                                                    ? `${row.reasonCode} - ${row.reasonText}`
                                                    : row.reasonText ?? "-"}

                                                {row.isReasonActive === false && (
                                                    <div className="text-xs font-medium text-warning mt-1">
                                                        Inactive reason. If changed, it cannot be selected again.
                                                    </div>
                                                )}
                                            </EditableCellButton>
                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfBags ?? "-"}
                                    </TableCell>

                                    <StdChargeTypeCell row={row} />
                                    <StdMilesCell row={row} />
                                    <StdRateChargeCell row={row} />

                                    <TableCell
                                        align="right"
                                        className="font-semibold tabular-nums"
                                    >
                                        {formatCurrencyGB(row.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <div className="flex justify-end gap-2">
                                                <DeleteRowButton
                                                    ariaLabel="Delete additional cost row"
                                                    onDelete={() =>
                                                        onDelete(row.clientId)
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

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated tabular-nums"
                                align="right"
                            >
                                {totalMiles}
                            </TableCell>

                            <TableCell className="sticky bottom-0 z-20 bg-surface-elevated" />

                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated font-semibold tabular-nums"
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