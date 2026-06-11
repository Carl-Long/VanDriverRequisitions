import { Skeleton } from "@/components/ui/skeleton";

export function FeRequisitionShellSkeleton() {
    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-80" />
                </div>

                <div className="flex justify-between">
                    <div className="flex gap-3">
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-6 w-px" />
                        <Skeleton className="h-6 w-32" />
                    </div>

                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
                <Skeleton className="h-10 w-30 rounded-xl" />
            </div>

            {/* Content */}
            {/* Content */}
            <div className="space-y-6">

                {/* Details tab heading */}
                <div>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="mt-2 h-4 w-64" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

                    {/* Details card */}
                    <div className="rounded-2xl border border-border p-6">
                        <div className="grid gap-6 xl:grid-cols-2">
                            <Skeleton className="h-16" />
                            <Skeleton className="h-16" />
                            <Skeleton className="h-16" />
                            <Skeleton className="h-16" />
                        </div>
                    </div>

                    {/* Driver summary */}
                    <div className="rounded-2xl border border-border p-6">
                        <Skeleton className="h-6 w-40" />

                        <div className="mt-4 space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}