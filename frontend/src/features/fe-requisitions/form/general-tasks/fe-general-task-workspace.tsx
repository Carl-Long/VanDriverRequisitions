import { EmptyState } from "@/components/ui/empty-state";
import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { calculateFeGeneralTaskTotals } from "../lib/calculate-fe-general-task-totals";
import { useState } from "react";
import { FeGeneralTaskDrawer } from "./fe-general-task-drawer";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { mapFeGeneralTaskDraftToForm } from "../lib/map-fe-general-task-draft-to-form";
import {
    TableHeader,
    TableHeaderCell,
    TableBody,
    TableCell,
    TableFooter,
    TableRow,
    TableHeaderRow,
} from "@/components/ui/table/table";
import { getGeneralTaskLimitStatus } from "../lib/get-fe-general-task-limit-status";
import { getEditableTableRowClassName } from "../lib/get-editable-table-row-class-name";
import { EditableCellButton } from "../components/editable-cell-button";
import { DeleteRowButton } from "../components/delete-row-button";

type Props = {
    readonly: boolean;
    title: string;
    code?: string | null;
    limitRule?: RequisitionLimitRuleSummary;
    tasks: FeGeneralTaskDraft[];
    onAdd: (form: FeGeneralTaskForm) => void;
    onUpdate: (clientId: string, form: FeGeneralTaskForm) => void;
    onDelete: (clientId: string) => void;
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
    const totals = calculateFeGeneralTaskTotals(tasks);

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
                    <p className="text-sm text-muted-foreground">
                        {tasks.length} entr{tasks.length === 1 ? "y" : "ies"} • {totals.totalJobs}{" "}
                        quantity • {formatCurrencyGB(totals.subtotal)}
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
                <EmptyState title={`No ${title}`} />
            ) : (
                <TasksTable
                    readonly={readonly}
                    tasks={tasks}
                    limitRule={limitRule}
                    onEdit={(task) => {
                        setEditingTask(task);
                        setOpen(true);
                    }}
                    onDelete={onDelete}
                />
            )}
            <FeGeneralTaskDrawer
                key={editingTask ? editingTask.clientId : "new"}
                open={open}
                title={editingTask ? `Edit ${title}` : `Add ${title}`}
                limitRule={limitRule}
                initialValues={editingTask ? mapFeGeneralTaskDraftToForm(editingTask) : undefined}
                onClose={() => {
                    setOpen(false);
                    setEditingTask(null);
                }}
                onSave={(form) => {
                    if (editingTask) {
                        onUpdate(editingTask.clientId, form);
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
    tasks: FeGeneralTaskDraft[];
    onEdit: (task: FeGeneralTaskDraft) => void;
    onDelete: (clientId: string) => void;
};

function TasksTable({ readonly, limitRule, tasks, onEdit, onDelete }: Readonly<TableProps>) {
    const totals = calculateFeGeneralTaskTotals(tasks);

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="max-h-[55vh] overflow-auto">
                <table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>
                            <TableHeaderCell className="sticky top-0 z-20 bg-surface-elevated">
                                Week Ending
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Sun
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Mon
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Tue
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Wed
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Thu
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Fri
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                Sat
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Total Qty
                            </TableHeaderCell>
                            <TableHeaderCell
                                className="sticky top-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                Rate
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
                        {tasks.map((task) => {
                            const limitStatus = getGeneralTaskLimitStatus(task, limitRule);
                            const hasLimitIssue = !readonly && limitStatus.state !== "ok";

                            return (
                                <TableRow
                                    key={task.clientId}
                                    onClick={readonly ? undefined : () => onEdit(task)}
                                    className={getEditableTableRowClassName({
                                        readonly,
                                        hasIssue: hasLimitIssue,
                                    })}
                                >
                                    <TableCell>
                                        <div>
                                            <EditableCellButton
                                                readonly={readonly}
                                                ariaLabel="Edit general task row"
                                                onEdit={() => onEdit(task)}
                                            >
                                                {task.weekEndingDate ? task.weekEndingDate.toLocaleDateString() : "-"}
                                            </EditableCellButton>

                                            {hasLimitIssue && (
                                                <div className="mt-1 space-y-1">
                                                    <div className="text-xs font-medium text-warning">
                                                        {limitStatus.state === "missing-limit" ? "Missing limit" : "Exceeds limit"}
                                                    </div>

                                                    <ul className="list-disc pl-4 text-xs text-warning">
                                                        {limitStatus.messages.map((message) => (
                                                            <li key={message}>{message}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.sunday ?? "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.monday ?? "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.tuesday ?? "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.wednesday ?? "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.thursday ?? "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.friday ?? "-"}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.quantities.saturday ?? "-"}
                                    </TableCell>

                                    <TableCell align="right">{task.totalNumber}</TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {formatCurrencyGB(task.ratePerJob ?? 0)}
                                    </TableCell>

                                    <TableCell align="right" className="font-semibold tabular-nums">
                                        {formatCurrencyGB(task.totalValue)}
                                    </TableCell>

                                    {!readonly && (
                                        <TableCell align="right" nowrap>
                                            <div className="flex justify-end gap-2">
                                                <DeleteRowButton
                                                    ariaLabel="Delete general task row"
                                                    onDelete={() => onDelete(task.clientId)}
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
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.sunday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.monday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.tuesday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.wednesday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.thursday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.friday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="center"
                            >
                                {totals.saturday}
                            </TableCell>
                            <TableCell
                                className="sticky bottom-0 z-20 bg-surface-elevated"
                                align="right"
                            >
                                {totals.totalJobs}
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
                </table>
            </div>
        </div >
    );
}
