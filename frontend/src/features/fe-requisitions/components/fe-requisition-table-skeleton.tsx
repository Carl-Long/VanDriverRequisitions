import { Surface } from "@/components/ui/surface";
import { Skeleton } from "@/components/ui/skeleton";

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

export function FeRequisitionTableSkeleton({
    rows = 8,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>
                            Requisition
                        </TableHeaderCell>

                        <TableHeaderCell>
                            Company
                        </TableHeaderCell>

                        <TableHeaderCell
                            align="center"
                            nowrap
                        >
                            Status
                        </TableHeaderCell>

                        <TableHeaderCell
                            align="right"
                            nowrap
                        >
                            Amount
                        </TableHeaderCell>

                        <TableHeaderCell>
                            Shop
                        </TableHeaderCell>

                        <TableHeaderCell>
                            Last Activity
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {Array.from({
                        length: rows,
                    }).map((_, index) => (
                        <TableRow key={index}>
                            {/* Requisition */}
                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="mt-2 h-3 w-24" />
                                </div>
                            </TableCell>

                            {/* Company */}
                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="mt-2 h-3 w-40" />
                                </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell
                                align="center"
                                nowrap
                            >
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            </TableCell>

                            {/* Amount */}
                            <TableCell
                                align="right"
                                nowrap
                            >
                                <Skeleton className="ml-auto h-4 w-20" />
                            </TableCell>

                            {/* Shop */}
                            <TableCell>
                                <div className="flex flex-col leading-tight">
                                    <Skeleton className="h-4 w-14" />

                                    <Skeleton className="mt-2 h-3 w-44" />
                                </div>
                            </TableCell>

                            {/* Last Activity */}
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