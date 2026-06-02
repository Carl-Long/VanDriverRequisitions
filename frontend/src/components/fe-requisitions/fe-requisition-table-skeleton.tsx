import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";

type Props = {
    rows?: number;
};

export function FeRequisitionTableSkeleton({
    rows = 8,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="p-4 text-left">Requisition</th>
                        <th className="p-4 text-left">Company</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-left">Shop</th>
                        <th className="p-4 text-left">Last Activity</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr
                            key={i}
                            className="border-b border-border-subtle"
                        >
                            <td className="p-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="mt-2 h-3 w-16" />
                            </td>

                            <td className="p-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="mt-2 h-3 w-40" />
                            </td>

                            <td className="p-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                            </td>

                            <td className="p-4">
                                <div className="flex justify-end">
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </td>

                            <td className="p-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="mt-2 h-3 w-32" />
                            </td>

                            <td className="p-4">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="mt-2 h-3 w-24" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Surface>
    );
}