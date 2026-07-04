import { Skeleton } from "@/components/ui/skeleton";

const tabWidths = [
    "w-24",
    "w-32",
    "w-36",
    "w-32",
    "w-36",
    "w-40",
    "w-44",
    "w-36",
] as const;

export function RequisitionShellSkeleton() {
    return (
        <div className="space-y-4">
            <div className="pb-2">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                                <Skeleton className="h-5 w-24" />

                                <div className="hidden h-4 w-px bg-border sm:block" />

                                <Skeleton className="h-5 w-64" />
                            </div>
                        </div>

                        <Skeleton className="h-10 w-full max-w-80" />
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <Skeleton className="h-7 w-24 rounded-full" />

                                <div className="h-4 w-px bg-border" />

                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-14" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-36" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="overflow-x-auto rounded-2xl border border-border bg-surface-elevated/70 p-1 shadow-sm">
                    <div className="flex min-w-max gap-1">
                        {tabWidths.map((width, index) => (
                            <Skeleton
                                key={`${width}-${index}`}
                                className={`h-9 shrink-0 rounded-xl ${width}`}
                            />
                        ))}
                    </div>
                </div>

                <div role="tabpanel">
                    <div className="space-y-6">
                        <div>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="mt-2 h-4 w-56" />
                        </div>

                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="rounded-2xl border border-border bg-surface p-6">
                                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-surface-elevated p-6 card-shadow">
                                <Skeleton className="h-5 w-36" />

                                <div className="mt-2 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                    <Skeleton className="h-4 w-3/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}