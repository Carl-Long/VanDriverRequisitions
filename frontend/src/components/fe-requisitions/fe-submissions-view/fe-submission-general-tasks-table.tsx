"use client";

import { TableHeader, TableHeaderRow, TableHeaderCell, TableBody, TableRow, TableCell, Table, TableFooter } from "@/components/ui/table/table";
import { FeGeneralTaskSnapshot } from "@/lib/api/fe-requisitions";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";


type Props = {
    tasks: FeGeneralTaskSnapshot[];
};

export function FeSubmissionGeneralTasksTable({
    tasks,
}: Readonly<Props>) {
    if (tasks.length === 0) {
        return null;
    }
    const orderedTasks = [...tasks].sort(
        (a, b) =>
            a.taskTypeName.localeCompare(b.taskTypeName) ||
            new Date(a.weekEndingDate).getTime() -
            new Date(b.weekEndingDate).getTime()
    );

    const totals = orderedTasks.reduce(
        (acc, task) => ({
            sunday:
                acc.sunday +
                (task.week.sunday ?? 0),

            monday:
                acc.monday +
                (task.week.monday ?? 0),

            tuesday:
                acc.tuesday +
                (task.week.tuesday ?? 0),

            wednesday:
                acc.wednesday +
                (task.week.wednesday ?? 0),

            thursday:
                acc.thursday +
                (task.week.thursday ?? 0),

            friday:
                acc.friday +
                (task.week.friday ?? 0),

            saturday:
                acc.saturday +
                (task.week.saturday ?? 0),

            totalJobs:
                acc.totalJobs +
                task.totalNumber,

            subtotal:
                acc.subtotal +
                task.totalValue,
        }),
        {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalJobs: 0,
            subtotal: 0,
        },
    );
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">
                    General Tasks
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted task quantities and values
                </p>

                <p className="text-sm text-muted-foreground">
                    {tasks.length} entr{tasks.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalJobs} quantity •{" "}
                    {formatCurrencyGB(totals.subtotal)}
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableHeaderRow>
                                <TableHeaderCell nowrap>
                                    Task Type
                                </TableHeaderCell>

                                <TableHeaderCell nowrap>
                                    Week Ending
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Sun
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Mon
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Tue
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Wed
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Thu
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Fri
                                </TableHeaderCell>

                                <TableHeaderCell align="center">
                                    Sat
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Total
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Rate
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Value
                                </TableHeaderCell>
                            </TableHeaderRow>
                        </TableHeader>

                        <TableBody>
                            {orderedTasks.map((task, index) => (
                                <TableRow
                                    key={`${task.taskTypeCode}-${index}`}
                                >
                                    <TableCell>
                                        <div className="font-medium">
                                            {task.taskTypeName}
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            {task.taskTypeCode}
                                        </div>
                                    </TableCell>
                                    <TableCell nowrap>
                                        {formatDateGB(task.weekEndingDate)}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.sunday ?? 0}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.monday ?? 0}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.tuesday ?? 0}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.wednesday ?? 0}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.thursday ?? 0}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.friday ?? 0}
                                    </TableCell>

                                    <TableCell align="center">
                                        {task.week.saturday ?? 0}
                                    </TableCell>

                                    <TableCell align="right">
                                        {task.totalNumber}
                                    </TableCell>

                                    <TableCell align="right">
                                        {formatCurrencyGB(task.ratePerJob)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        className="font-semibold tabular-nums"
                                    >
                                        {formatCurrencyGB(task.totalValue)}
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>
                                    Totals
                                </TableCell>

                                <TableCell />

                                <TableCell align="center">
                                    {totals.sunday}
                                </TableCell>

                                <TableCell align="center">
                                    {totals.monday}
                                </TableCell>

                                <TableCell align="center">
                                    {totals.tuesday}
                                </TableCell>

                                <TableCell align="center">
                                    {totals.wednesday}
                                </TableCell>

                                <TableCell align="center">
                                    {totals.thursday}
                                </TableCell>

                                <TableCell align="center">
                                    {totals.friday}
                                </TableCell>

                                <TableCell align="center">
                                    {totals.saturday}
                                </TableCell>

                                <TableCell align="right">
                                    {totals.totalJobs}
                                </TableCell>

                                <TableCell />

                                <TableCell
                                    align="right"
                                    className="font-semibold tabular-nums"
                                >
                                    {formatCurrencyGB(
                                        totals.subtotal,
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </div>
    );
}