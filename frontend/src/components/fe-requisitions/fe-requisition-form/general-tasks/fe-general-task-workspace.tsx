import { EmptyState } from "@/components/ui/empty-state";
import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { calculateFeGeneralTaskTotals } from "../lib/calculate-fe-general-task-totals";

import { useState } from "react";
import { FeGeneralTaskDrawer } from "./fe-general-task-drawer";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import type {
    RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";
import { formatCurrencyGB } from "@/lib/format/currency";
import { IconButton } from "@/components/ui/button/icon-button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { mapFeGeneralTaskDraftToForm } from "../lib/map-fe-general-task-draft-to-form";
import { TableHeaderRow } from "@/components/ui/table/table-header-row";

type Props = {
    readonly: boolean;
    title: string;
    code?: string | null;
    limitRule?: RequisitionLimitRuleSummary;
    tasks: FeGeneralTaskDraft[];
    onAdd: (
        form: FeGeneralTaskForm,
    ) => void;
    onUpdate: (
        clientId: string,
        form: FeGeneralTaskForm,
    ) => void;
    onDelete: (
        clientId: string,
    ) => void;
};



export function FeGeneralTaskWorkspace({
    readonly,
    title,
    code,
    limitRule,
    tasks,
    onAdd,
    onUpdate,
    onDelete,
}: Readonly<Props>) {

    const [open, setOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<FeGeneralTaskDraft | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-md font-semibold">
                        {title} ({code})
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Manage {title.toLowerCase()} entries
                    </p>
                </div>

                {!readonly && (
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingTask(null);
                            setOpen(true);
                        }}
                    >
                        <Plus size={14} />
                        Add {title}
                    </Button>
                )}
            </div>

            {tasks.length === 0 ? (
                <EmptyState
                    title={`No ${title}`}
                />
            ) : (
                <TasksTable
                    readonly={readonly}
                    tasks={tasks}
                    onEdit={(task) => {
                        setEditingTask(task);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}
            <FeGeneralTaskDrawer
                key={
                    editingTask
                        ? editingTask.clientId
                        : "new"
                }
                open={open}
                title={
                    editingTask
                        ? `Edit ${title}`
                        : `Add ${title}`
                }
                limitRule={limitRule}
                initialValues={
                    editingTask
                        ? mapFeGeneralTaskDraftToForm(
                            editingTask,
                        )
                        : undefined
                }
                onClose={() => {
                    setOpen(false);
                    setEditingTask(null);
                }}
                onSave={(form) => {
                    if (editingTask) {
                        onUpdate(
                            editingTask.clientId,
                            form,
                        );
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

    tasks: FeGeneralTaskDraft[];

    onEdit: (
        task: FeGeneralTaskDraft,
    ) => void;

    onDelete: (
        clientId: string,
    ) => void;
};

function TasksTable({
    readonly,
    tasks,
    onEdit,
    onDelete,
}: Readonly<TableProps>) {
    const totals =
        calculateFeGeneralTaskTotals(
            tasks,
        );
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="sticky top-0 z-10 bg-surface-elevated border-b border-border">
                        <TableHeaderRow>
                            <HeaderCell>
                                Week Ending
                            </HeaderCell>

                            <HeaderCell>
                                Sun
                            </HeaderCell>

                            <HeaderCell>
                                Mon
                            </HeaderCell>

                            <HeaderCell>
                                Tue
                            </HeaderCell>

                            <HeaderCell>
                                Wed
                            </HeaderCell>

                            <HeaderCell>
                                Thu
                            </HeaderCell>

                            <HeaderCell>
                                Fri
                            </HeaderCell>

                            <HeaderCell>
                                Sat
                            </HeaderCell>

                            <HeaderCell>
                                Total Qty
                            </HeaderCell>

                            <HeaderCell>
                                Rate
                            </HeaderCell>

                            <HeaderCell>
                                Total
                            </HeaderCell>

                            {!readonly && (
                                <HeaderCell>
                                    Actions
                                </HeaderCell>
                            )}
                        </TableHeaderRow>
                    </thead>

                    <tbody className="divide-y divide-border">
                        {tasks.map((task) => (
                            <tr
                                key={
                                    task.clientId
                                }
                            >

                                <BodyCell>
                                    {task.weekEndingDate
                                        ? task.weekEndingDate.toLocaleDateString()
                                        : "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .sunday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .monday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .tuesday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .wednesday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .thursday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .friday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.quantities
                                        .saturday ?? "-"}
                                </BodyCell>

                                <BodyCell>
                                    {task.totalNumber}
                                </BodyCell>

                                <BodyCell>
                                    {formatCurrencyGB(task.ratePerJob ?? 0)}
                                </BodyCell>

                                <BodyCell>
                                    {formatCurrencyGB(task.totalValue)}
                                </BodyCell>

                                {!readonly && (
                                    <BodyCell>
                                        <div className="flex gap-2">

                                            <IconButton
                                                variant="ghost"
                                                onClick={() =>
                                                    onEdit(task)
                                                }
                                            >
                                                <Pencil size={14} />
                                            </IconButton>

                                            <IconButton
                                                tone="danger"
                                                variant="ghost"
                                                onClick={() =>
                                                    onDelete(
                                                        task.clientId,
                                                    )
                                                }
                                            >
                                                <Trash2 size={14} />
                                            </IconButton>

                                        </div>
                                    </BodyCell>
                                )}

                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t border-border bg-muted/20">
                        <tr>
                            <FooterCell>
                                Totals
                            </FooterCell>

                            <FooterCell>
                                {totals.sunday}
                            </FooterCell>

                            <FooterCell>
                                {totals.monday}
                            </FooterCell>

                            <FooterCell>
                                {totals.tuesday}
                            </FooterCell>

                            <FooterCell>
                                {totals.wednesday}
                            </FooterCell>

                            <FooterCell>
                                {totals.thursday}
                            </FooterCell>

                            <FooterCell>
                                {totals.friday}
                            </FooterCell>

                            <FooterCell>
                                {totals.saturday}
                            </FooterCell>

                            <FooterCell>
                                {totals.totalJobs}
                            </FooterCell>

                            <FooterCell>
                                -
                            </FooterCell>

                            <FooterCell>
                                {formatCurrencyGB(totals.subtotal)}
                            </FooterCell>
                            {!readonly && (
                                <FooterCell>
                                    -
                                </FooterCell>
                            )}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

type CellProps = {
    children: React.ReactNode;
};

function HeaderCell({
    children,
}: Readonly<CellProps>) {
    return (
        <th
            className="
                px-4 py-3 text-left text-xs
                font-medium uppercase tracking-wide
                text-foreground font-semibold
            "
        >
            {children}
        </th>
    );
}

function BodyCell({
    children,
}: Readonly<CellProps>) {
    return (
        <td className="px-4 py-3 text-sm">
            {children}
        </td>
    );
}

function FooterCell({
    children,
}: Readonly<CellProps>) {
    return (
        <td
            className="
                px-4 py-3 text-sm font-semibold
            "
        >
            {children}
        </td>
    );
}