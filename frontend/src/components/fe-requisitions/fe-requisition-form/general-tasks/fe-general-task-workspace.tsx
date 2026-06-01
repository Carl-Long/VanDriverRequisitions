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
import { TableHeader, TableHeaderCell, TableBody, TableCell, TableFooter } from "@/components/ui/table/table";
import { TableRow } from "@/components/ui/table/table-row";

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
                <table className="min-w-full">
                    <TableHeader>
                        <TableHeaderRow>
                            <TableHeaderCell>
                                Week Ending
                            </TableHeaderCell>

                            <TableHeaderCell align="center">Sun</TableHeaderCell>
                            <TableHeaderCell align="center">Mon</TableHeaderCell>
                            <TableHeaderCell align="center">Tue</TableHeaderCell>
                            <TableHeaderCell align="center">Wed</TableHeaderCell>
                            <TableHeaderCell align="center">Thu</TableHeaderCell>
                            <TableHeaderCell align="center">Fri</TableHeaderCell>
                            <TableHeaderCell align="center">Sat</TableHeaderCell>

                            <TableHeaderCell align="right">
                                Total Qty
                            </TableHeaderCell>

                            <TableHeaderCell align="right">
                                Rate
                            </TableHeaderCell>

                            <TableHeaderCell align="right">
                                Total
                            </TableHeaderCell>

                            {!readonly && (
                                <TableHeaderCell align="right" nowrap>
                                    Actions
                                </TableHeaderCell>
                            )}
                        </TableHeaderRow>
                    </TableHeader>

                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.clientId}>
                                <TableCell>
                                    {task.weekEndingDate
                                        ? task.weekEndingDate.toLocaleDateString()
                                        : "-"}
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

                                <TableCell align="right">
                                    {task.totalNumber}
                                </TableCell>

                                <TableCell
                                    align="right"
                                    className="tabular-nums"
                                >
                                    {formatCurrencyGB(task.ratePerJob ?? 0)}
                                </TableCell>

                                <TableCell
                                    align="right"
                                    className="font-semibold tabular-nums"
                                >
                                    {formatCurrencyGB(task.totalValue)}
                                </TableCell>

                                {!readonly && (
                                    <TableCell align="right" nowrap>
                                        <div className="flex justify-end gap-2">
                                            <IconButton
                                                variant="ghost"
                                                tone="accent"
                                                onClick={() => onEdit(task)}
                                            >
                                                <Pencil size={14} />
                                            </IconButton>

                                            <IconButton
                                                tone="danger"
                                                variant="ghost"
                                                onClick={() =>
                                                    onDelete(task.clientId)
                                                }
                                            >
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>

                    <TableFooter>
                        <TableRow className="hover:bg-transparent">
                            <TableCell>Totals</TableCell>
                            <TableCell align="center">{totals.sunday}</TableCell>
                            <TableCell align="center">{totals.monday}</TableCell>
                            <TableCell align="center">{totals.tuesday}</TableCell>
                            <TableCell align="center">{totals.wednesday}</TableCell>
                            <TableCell align="center">{totals.thursday}</TableCell>
                            <TableCell align="center">{totals.friday}</TableCell>
                            <TableCell align="center">{totals.saturday}</TableCell>
                            <TableCell align="right">{totals.totalJobs}</TableCell>
                            <td></td>
                            <TableCell align="right" className="tabular-nums">
                                {formatCurrencyGB(totals.subtotal)}
                            </TableCell>
                            {!readonly && (
                                <td></td>
                            )}
                        </TableRow>
                    </TableFooter>
                </table>
            </div>
        </div>
    );
}
