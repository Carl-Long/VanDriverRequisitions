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

import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";
import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";
import { mapStdCollectionVanPackDraftToForm } from "../lib/map-std-collection-van-pack-draft-to-form";
import { StdCollectionVanPackDrawer } from "./std-collection-van-pack-drawer";
import { getStdCollectionVanPackLimitStatus } from "../lib/get-std-collection-van-pack-limit-status";
import { DeleteRowButton } from "@/features/fe-requisitions/form/components/delete-row-button";
import { EditableCellButton } from "@/features/fe-requisitions/form/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/fe-requisitions/form/lib/get-editable-table-row-class-name";

type Props = {
    readonly: boolean;
    rows: StdCollectionVanPackDraft[];
    vanPackLimitRule?: RequisitionLimitRuleSummary;
    onAdd: (form: StdCollectionVanPackForm, ratePerVanPack: number) => void;
    onUpdate: (
        clientId: string,
        form: StdCollectionVanPackForm,
        ratePerVanPack: number,
    ) => void;
    onDelete: (clientId: string) => void;
};

export function StdCollectionVanPackWorkspace({
    readonly,
    rows,
    vanPackLimitRule,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<StdCollectionVanPackDraft | null>(
        null,
    );

    const subtotal = rows.reduce((total, row) => total + row.totalValue, 0);
    const totalVanPacksOut = rows.reduce(
        (total, row) => total + (row.vanPacksOut ?? 0),
        0,
    );
    const totalFilledBags = rows.reduce(
        (total, row) => total + (row.filledBags ?? 0),
        0,
    );

    function openEditDrawer(row: StdCollectionVanPackDraft) {
        if (readonly) {
            return;
        }

        setEditingRow(row);
        setOpen(true);
    }

    function saveRow(form: StdCollectionVanPackForm) {
        if (!vanPackLimitRule) {
            return;
        }

        if (editingRow) {
            onUpdate(editingRow.clientId, form, vanPackLimitRule.maxRate);
        } else {
            onAdd(form, vanPackLimitRule.maxRate);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">Van Pack Collections</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage van pack collection entries
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                        {totalVanPacksOut} van packs out •{" "}
                        {formatCurrencyGB(subtotal)}
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        disabled={!vanPackLimitRule}
                        onClick={() => {
                            setEditingRow(null);
                            setOpen(true);
                        }}
                    >
                        <Plus size={14} />
                        Add Van Pack Collection
                    </Button>
                )}
            </div>

            {!vanPackLimitRule && !readonly && (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
                    No STD van pack pricing rule is configured. Rows cannot be added until
                    this is configured.
                </div>
            )}

            {rows.length === 0 ? (
                <EmptyState title="No Van Pack Collections" />
            ) : (
                <VanPackTable
                    readonly={readonly}
                    rows={rows}
                    vanPackLimitRule={vanPackLimitRule}
                    totalVanPacksOut={totalVanPacksOut}
                    totalFilledBags={totalFilledBags}
                    subtotal={subtotal}
                    onEdit={openEditDrawer}
                    onDelete={onDelete}
                />
            )}

            <StdCollectionVanPackDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={
                    editingRow
                        ? "Edit Van Pack Collection"
                        : "Add Van Pack Collection"
                }
                vanPackLimitRule={vanPackLimitRule}
                initialValues={
                    editingRow
                        ? mapStdCollectionVanPackDraftToForm(editingRow)
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
    rows: StdCollectionVanPackDraft[];
    vanPackLimitRule?: RequisitionLimitRuleSummary;
    totalVanPacksOut: number;
    totalFilledBags: number;
    subtotal: number;
    onEdit: (row: StdCollectionVanPackDraft) => void;
    onDelete: (clientId: string) => void;
};

function VanPackTable({
    readonly,
    rows,
    vanPackLimitRule,
    totalVanPacksOut,
    totalFilledBags,
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
                                Delivery Date
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Postcode Zone
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Van Packs Out
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Filled Bags
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Unused
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Returned
                            </TableHeaderCell>

                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated" align="right">
                                Fixed Price
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
                            const limitStatus = getStdCollectionVanPackLimitStatus(
                                row,
                                vanPackLimitRule,
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
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit van pack collection row"
                                                onEdit={() => onEdit(row)}
                                            >
                                                {row.deliveryDate
                                                    ? row.deliveryDate.toLocaleDateString()
                                                    : "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <div className="mt-1 space-y-1">
                                                    <div className="text-xs font-medium text-warning">
                                                        {limitStatus.state === "missing-limit"
                                                            ? "Missing price"
                                                            : "Exceeds price"}
                                                    </div>

                                                    <ul className="list-disc pl-4 text-xs text-warning">
                                                        {limitStatus.messages.map((message, index) => (
                                                            <li key={`${message}-${index}`}>
                                                                {message}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>{row.postCodeZone ?? "-"}</TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.vanPacksOut ?? "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.filledBags ?? "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.unusedVanPacks}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.percentReturned.toFixed(2)}%
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {formatCurrencyGB(row.ratePerVanPack)}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {formatCurrencyGB(row.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right">
                                            <DeleteRowButton
                                                ariaLabel="Delete van pack collection row"
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
                            <TableCell align="right" className="tabular-nums">
                                {totalVanPacksOut}
                            </TableCell>
                            <TableCell align="right" className="tabular-nums">
                                {totalFilledBags}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell align="right" className="tabular-nums">
                                {formatCurrencyGB(subtotal)}
                            </TableCell>
                            {!readonly && <TableCell />}
                        </TableRow>
                    </TableFooter>
                </table>
            </div>
        </div>
    );
}