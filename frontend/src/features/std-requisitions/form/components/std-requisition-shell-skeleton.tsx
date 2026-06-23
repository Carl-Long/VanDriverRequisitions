import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "@/components/ui/surface";

export function StdRequisitionShellSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Skeleton className="h-7 w-72" />
                <Skeleton className="h-6 w-48" />
            </div>

            <Surface className="p-1">
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                    <Skeleton className="h-10 w-48 rounded-xl" />
                </div>
            </Surface>

            <Surface className="p-6">
                <div className="grid gap-6 xl:grid-cols-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </Surface>
        </div>
    );
}