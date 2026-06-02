import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";

type Props = {
    rows?: number;
    columns?: number;
};

export function TableSkeleton({
    rows = 5,
    columns = 4,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th
                                key={i}
                                className="px-4 py-3 bg-surface-elevated"
                            >
                                <Skeleton className="h-4 w-24" />
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Array.from({ length: rows }).map((_, row) => (
                        <tr
                            key={row}
                            className="border-t border-border"
                        >
                            {Array.from({ length: columns }).map((_, col) => (
                                <td
                                    key={col}
                                    className="px-4 py-4"
                                >
                                    <Skeleton className="h-4 w-full max-w-[180px]" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Surface>
    );
}