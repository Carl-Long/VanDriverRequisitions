import { EmptyState } from "@/components/ui/empty-state";
import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { calculateFeGeneralTaskTotals } from "../lib/calculate-fe-general-task-totals";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import { useState } from "react";
import { FeGeneralTaskDrawer } from "./fe-general-task-drawer";

type Props = {
    readonly: boolean;
    title: string;
    code?: string | null;
    tasks: FeGeneralTaskDraft[];
    onAdd: (
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
    tasks,
    onAdd,
    onDelete,
}: Readonly<Props>) {

    const [open, setOpen] = useState(false);
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        {title} ({code})
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Manage {title.toLowerCase()} entries
                    </p>
                </div>

                {!readonly && (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="
                            rounded-xl bg-primary
                            px-4 py-2 text-sm font-medium
                            text-primary-foreground
                            hover:opacity-90
                        "
                    >
                        Add {title}
                    </button>
                )}
            </div>

            {tasks.length === 0 ? (
                <EmptyState
                    title={title}
                />
            ) : (
                <TasksTable
                    readonly={
                        readonly
                    }
                    tasks={tasks}
                    onDelete={
                        onDelete
                    }
                />
            )}
            <FeGeneralTaskDrawer
                open={open}
                title={`Add ${title}`}
                onClose={() =>
                    setOpen(false)
                }
                onSave={(form) => {
                    onAdd(form);

                    setOpen(false);
                }}
            />
        </div>
    );
}

type TableProps = {
    readonly: boolean;

    tasks: FeGeneralTaskDraft[];

    onDelete: (
        clientId: string,
    ) => void;
};

function TasksTable({
    readonly,
    tasks,
    onDelete,
}: Readonly<TableProps>) {
    const totals =
        calculateFeGeneralTaskTotals(
            tasks,
        );
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                    <tr>
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
                    </tr>
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
                                £
                                {task.ratePerJob?.toFixed(
                                    2,
                                ) ?? "0.00"}
                            </BodyCell>

                            <BodyCell>
                                £
                                {task.totalValue.toFixed(
                                    2,
                                )}
                            </BodyCell>

                            {!readonly && (
                                <BodyCell>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDelete(
                                                task.clientId,
                                            )
                                        }
                                        className="
                    text-sm text-danger
                    hover:underline
                "
                                    >
                                        Delete
                                    </button>
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
                            £
                            {totals.subtotal.toFixed(
                                2,
                            )}
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
                text-muted-foreground
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