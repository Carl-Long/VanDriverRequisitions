"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { TableHeader, TableHeaderCell, TableBody, TableCell, TableFooter, TableRow, TableHeaderRow, Table, } from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FeMileageDraft } from "../types/fe-mileage-draft";
import { FeMileageForm } from "../types/fe-mileage-form";
import { calculateFeMileageTotals } from "../lib/calculate-fe-mileage-totals";
import { mapFeMileageDraftToForm } from "../lib/map-fe-mileage-draft-to-form";
import { FeMileageDrawer } from "./fe-mileage-drawer";
import { getMileageLimitStatus } from "../lib/get-fe-mileage-limit-status";
import { getEditableTableRowClassName } from "../../../requisitions-shared/lib/get-editable-table-row-class-name";
import { EditableCellButton } from "../../../requisitions-shared/components/editable-cell-button";
import { DeleteRowButton } from "../../../requisitions-shared/components/delete-row-button";
import { formatDateGB } from "@/lib/format/date";
import { RequisitionWorkspaceHeader } from "@/features/requisitions-shared/components/requisition-workspace-header";
import { RequisitionLimitWarningBlock } from "@/features/requisitions-shared/components/requisition-limit-warning-block";
import { getRequisitionRowIssueSeverity } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

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
            <RequisitionWorkspaceHeader
                title="Mileage"
                description="Manage mileage entries"
                summary={
                    <>
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totals.totalMiles} miles • {formatCurrencyGB(totals.subtotal)}
                    </>
                }
                actionLabel="Add Mileage"
                actionHidden={readonly}
                onAction={() => {
                    setEditingRow(null);
                    setOpen(true);
                }}
            />

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
                <Table className="min-w-full">
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
                                    Delete
                                </TableHeaderCell>
                            )}
                        </TableHeaderRow>
                    </TableHeader>

                    <TableBody>
                        {rows.map((row) => {
                            const limitStatus = getMileageLimitStatus(row, limitRule);
                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";
                            const issueSeverity = getRequisitionRowIssueSeverity({hasBlocker: hasLimitIssue});

                            return (
                                <TableRow
                                    key={row.clientId}
                                    onClick={readonly ? undefined : () => onEdit(row)}
                                    className={getEditableTableRowClassName({
                                        readonly,
                                        issueSeverity
                                    })}
                                >
                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit mileage row"
                                                onEdit={() => onEdit(row)}
                                            >
                                                {formatDateGB(row.weekEndingDate) ?? "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <RequisitionLimitWarningBlock
                                                    status={limitStatus}
                                                    className="mt-1"
                                                />
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
                                                <DeleteRowButton
                                                    ariaLabel="Delete mileage row"
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
                </Table>
            </div>
        </div>
    );
}

