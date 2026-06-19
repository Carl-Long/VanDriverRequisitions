"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableBody, TableCell, TableFooter, TableHeader, TableHeaderCell, TableHeaderRow, TableRow, } from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";

import { getStdChargeTypeLabel } from "../../constants/std-charge-type.constants";
import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionChargeBanksAndBinsRowsTotal } from "../lib/calculate-std-collection-charge-banks-and-bins-form";
import { mapStdCollectionChargeBanksAndBinsDraftToForm } from "../lib/map-std-collection-charge-banks-and-bins-draft-to-form";
import { StdCollectionChargeBanksAndBinsDrawer } from "./std-collection-charge-banks-and-bins-drawer";
import { DeleteRowButton } from "@/features/fe-requisitions/form/components/delete-row-button";
import { EditableCellButton } from "@/features/fe-requisitions/form/components/editable-cell-button";
import { getEditableTableRowClassName } from "@/features/fe-requisitions/form/lib/get-editable-table-row-class-name";
import { Alert } from "@/components/ui/alert";

type Props = {
    readonly: boolean;
    shopId: string | null;
    rows: StdCollectionChargeBanksAndBinsDraft[];
    onAdd: (form: StdCollectionChargeBanksAndBinsForm) => void;
    onUpdate: (clientId: string, form: StdCollectionChargeBanksAndBinsForm) => void;
    onDelete: (clientId: string) => void;
};

export function StdCollectionChargeBanksAndBinsWorkspace({
    readonly,
    shopId,
    rows,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<StdCollectionChargeBanksAndBinsDraft | null>(
        null,
    );

    const subtotal = calculateStdCollectionChargeBanksAndBinsRowsTotal(rows);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-md font-semibold">Banks & Bins Collection Charges</h2>

                    <p className="text-sm text-muted-foreground">
                        Manage collection charges for banks and bins.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {rows.length} entr{rows.length === 1 ? "y" : "ies"} • {formatCurrencyGB(subtotal)}
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        disabled={!shopId}
                        onClick={() => {
                            setEditingRow(null);
                            setOpen(true);
                        }}
                    >
                        <Plus size={14} />
                        Add Banks & Bins Charge
                    </Button>
                )}
            </div>

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
                    onEdit={(row) => {
                        setEditingRow(row);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}

            <StdCollectionChargeBanksAndBinsDrawer
                key={editingRow ? editingRow.clientId : "new"}
                open={open}
                title={editingRow ? "Edit Banks & Bins Row" : "Add Banks & Bins Row"}
                shopId={shopId}
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
    onEdit: (row: StdCollectionChargeBanksAndBinsDraft) => void;
    onDelete: (clientId: string) => void;
};

function BanksAndBinsTable({ readonly, rows, onEdit, onDelete }: Readonly<TableProps>) {
    const subtotal = calculateStdCollectionChargeBanksAndBinsRowsTotal(rows);

    const totalBags = rows.reduce((total, row) => total + (row.numberOfBags ?? 0), 0);

    const totalMiles = rows.reduce((total, row) => {
        return row.chargeType === "Mileage" ? total + (row.miles ?? 0) : total;
    }, 0);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <table className="min-w-full">
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
                        {rows.map((row) => (
                            <TableRow
                                key={row.clientId}
                                onClick={readonly ? undefined : () => onEdit(row)}
                                className={getEditableTableRowClassName({ readonly })}
                            >
                                <TableCell>{row.date ? formatDateGB(row.date) : "-"}</TableCell>

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
                                    </div>
                                </TableCell>

                                <TableCell align="right" className="tabular-nums">
                                    {row.numberOfBags ?? "-"}
                                </TableCell>

                                <TableCell>{getStdChargeTypeLabel(row.chargeType)}</TableCell>

                                <TableCell align="right" className="tabular-nums">
                                    {row.chargeType === "Mileage" ? row.miles ?? "-" : "-"}
                                </TableCell>

                                <TableCell align="right" className="tabular-nums">
                                    {row.chargeType === "Mileage"
                                        ? formatCurrencyGB(row.ratePerMile ?? 0)
                                        : formatCurrencyGB(row.flatCharge ?? 0)}
                                </TableCell>

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
                        ))}
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
                </table>
            </div>
        </div>
    );
}