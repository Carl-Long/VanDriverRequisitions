import { EmptyState } from "@/components/ui/empty-state";
import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";

type Props = {
    readonly: boolean;
    tasks: FeGeneralTaskDraft[];
    onAdd: () => void;
    onDelete: (
        clientId: string,
    ) => void;
};

export function FeGeneralTasksSection({
    readonly,

    tasks,

    onAdd,

    onDelete,
}: Readonly<Props>) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">
                        General Tasks
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Manage
                        requisition
                        general task
                        entries
                    </p>
                </div>

                {!readonly && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="
                            rounded-xl bg-primary
                            px-4 py-2 text-sm font-medium
                            text-primary-foreground
                            hover:opacity-90
                        "
                    >
                        Add Task
                    </button>
                )}
            </div>

            {tasks.length === 0 ? (
                <EmptyState title="No general tasks added yet" />
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
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                    <tr>
                        <HeaderCell>
                            Task Type
                        </HeaderCell>

                        <HeaderCell>
                            Week Ending
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
                                {task.taskTypeLabel ??
                                    "Not set"}
                            </BodyCell>

                            <BodyCell>
                                {task.weekEndingDate
                                    ? task.weekEndingDate.toLocaleDateString()
                                    : "-"}
                            </BodyCell>

                            <BodyCell>
                                {
                                    task.totalNumber
                                }
                            </BodyCell>

                            <BodyCell>
                                £
                                {task.ratePerJob?.toFixed(
                                    2,
                                ) ??
                                    "0.00"}
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