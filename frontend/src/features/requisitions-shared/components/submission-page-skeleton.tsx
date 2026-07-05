"use client";

import { Skeleton } from "@/components/ui/skeleton";

const snapshotSummaryFields = [
    "requisitionNumber",
    "vanDriver",
    "shop",
    "weekEndingDate",
    "submittedBy",
    "submittedAt",
    "total",
    "status",
] as const;

const submissionRows = [
    "row-1",
    "row-2",
    "row-3",
    "row-4",
    "row-5",
    "row-6",
] as const;

function SubmissionActionsSkeleton() {
    return (
        <div className="flex items-center justify-between gap-3 print:hidden">
            <Skeleton className="h-10 w-36 rounded-full" />

            <Skeleton className="h-10 w-40 rounded-full" />
        </div>
    );
}

function SubmissionHeaderSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="mt-3 h-4 w-72 max-w-full" />
                </div>

                <Skeleton className="h-7 w-24 shrink-0 rounded-full" />
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
                <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {snapshotSummaryFields.map((field) => (
                    <div key={field}>
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="mt-2 h-5 w-32" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SubmissionRowsSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-2 h-4 w-64 max-w-full" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border">
                <div className="space-y-3 p-4">
                    {submissionRows.map((row) => (
                        <Skeleton key={row} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SubmissionPageSkeleton() {
    return (
        <div className="space-y-4">
            <SubmissionActionsSkeleton />

            <div className="print-page">
                <div className="space-y-6 submission-print">
                    <SubmissionHeaderSkeleton />

                    <SnapshotSummarySkeleton />

                    <SubmissionRowsSkeleton />
                </div>
            </div>
        </div>
    );
}