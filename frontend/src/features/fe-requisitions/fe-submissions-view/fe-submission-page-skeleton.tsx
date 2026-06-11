"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SubmissionHeaderSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between">
                <div>
                    <Skeleton className="h-8 w-56" />

                    <Skeleton className="mt-3 h-4 w-72" />
                </div>

                <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                    <Skeleton className="h-4 w-20" />

                    <Skeleton className="mt-3 h-4 w-40" />

                    <Skeleton className="mt-2 h-4 w-48" />
                </div>

                <div>
                    <Skeleton className="h-4 w-20" />

                    <Skeleton className="mt-3 h-4 w-40" />

                    <Skeleton className="mt-2 h-4 w-48" />
                </div>
            </div>
        </div>
    );
}

function SnapshotSummarySkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="mt-2 h-4 w-72" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index}>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="mt-2 h-5 w-32" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function GeneralTasksSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6">
                <Skeleton className="h-6 w-40" />

                <Skeleton className="mt-2 h-4 w-64" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border">
                <div className="space-y-3 p-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function FeSubmissionPageSkeleton() {
    return (
        <div className="space-y-6">
            <SubmissionHeaderSkeleton />

            <SnapshotSummarySkeleton />

            <GeneralTasksSkeleton />
        </div>
    );
}
