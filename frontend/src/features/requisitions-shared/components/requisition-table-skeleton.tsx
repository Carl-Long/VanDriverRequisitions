import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableHeaderRow,
    TableRow,
} from "@/components/ui/table/table";

type Props = {
    rows?: number;
};

export function RequisitionTableSkeleton({ rows = 10 }: Readonly<Props>) {
    const rowKeys = createSkeletonKeys("requisition-table-row", rows);

    return (
        <Surface className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Requisition</TableHeaderCell>

                        <TableHeaderCell>Van Driver</TableHeaderCell>

                        <TableHeaderCell align="center" nowrap>
                            Status
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Amount
                        </TableHeaderCell>

                        <TableHeaderCell>Shop</TableHeaderCell>

                        <TableHeaderCell>Last Activity</TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {rowKeys.map((rowKey) => (
                        <TableRow key={rowKey}>
                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="mt-2 h-3 w-24" />
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="mt-2 h-3 w-48" />
                                </div>
                            </TableCell>

                            <TableCell align="center" nowrap>
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            </TableCell>

                            <TableCell align="right" nowrap>
                                <Skeleton className="ml-auto h-4 w-20" />
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="mt-2 h-3 w-44" />
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="mt-2 h-3 w-24" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Surface>
    );
}

function createSkeletonKeys(prefix: string, count: number) {
    return Array.from(
        { length: count },
        (_, itemNumber) => `${prefix}-${itemNumber + 1}`,
    );
}