"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarX, Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import type { PagedResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { Alert } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/api/client";
import { submitWindowsApi } from "@/features/submit-windows/api/submit-windows-api";
import { SubmitWindowFormModal } from "@/features/submit-windows/components/submit-window-form-modal";
import { SubmitWindowHero } from "@/features/submit-windows/components/submit-window-hero";
import { SubmitWindowTable } from "@/features/submit-windows/components/submit-window-table";
import {
    SubmitWindow,
    SubmitWindowFilter,
} from "@/features/submit-windows/types/submit-window.types";
import { useCrudModal } from "@/hooks/use-crud-modal";

const PAGE_SIZE = 10;

const filterOptions: {
    value: SubmitWindowFilter;
    label: string;
    activeClassName: string;
}[] = [
    {
        value: "active",
        label: "Current & Upcoming",
        activeClassName: "bg-success/20 text-foreground shadow-sm",
    },
    {
        value: "past",
        label: "Completed",
        activeClassName: "bg-accent/20 text-foreground shadow-sm",
    },
    {
        value: "deleted",
        label: "Deleted",
        activeClassName: "bg-danger/20 text-foreground shadow-sm",
    },
];

export default function SubmitWindowsPage() {
    const [data, setData] = useState<PagedResult<SubmitWindow> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<SubmitWindowFilter>("active");

    const modal = useCrudModal<SubmitWindow>();

    const {
        status: windowStatus,
        loading: statusLoading,
        refreshing: statusRefreshing,
        refresh: refreshStatus,
    } = useSubmitWindowStatus();

    const toast = useToast();

    const emptyState = (() => {
        switch (filter) {
            case "active":
                return {
                    icon: CalendarX,
                    title: "No current or upcoming submit windows",
                    description:
                        "Create a new submit window to allow requisitions to be submitted.",
                };

            case "past":
                return {
                    icon: CalendarX,
                    title: "No past submit windows",
                    description: "Once submit windows close, they will appear here.",
                };

            case "deleted":
                return {
                    icon: CalendarX,
                    title: "No deleted submit windows",
                    description: "Deleted submit windows will appear here.",
                };
        }
    })();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await submitWindowsApi.getAll(page, PAGE_SIZE, filter);
            setData(result);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to load submit windows."));
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [filter]);

    async function handleSubmit(data: { openFrom: string; openTo: string }) {
        setError(null);

        if (modal.editing) {
            await submitWindowsApi.update(modal.editing.id, data);
            toast.success("Submit window updated");
        } else {
            await submitWindowsApi.create(data);
            toast.success("Submit window created");
        }

        modal.close();
        await Promise.all([load(), refreshStatus()]);
    }

    async function handleDelete(window: SubmitWindow) {
        setError(null);

        try {
            await submitWindowsApi.delete(window.id);
            toast.success("Submit window deleted");

            await Promise.all([load(), refreshStatus()]);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to delete submit window."));
        }
    }

    function handleFilterChange(nextFilter: SubmitWindowFilter) {
        setFilter(nextFilter);
    }

    function handlePageChange(newPage: number) {
        setPage(newPage);
    }

    return (
        <PageContainer>
            <PageHeader
                title="Submit Windows"
                description="Manage the time windows during which requisitions can be submitted."
            >
                <Button onClick={modal.openCreate}>
                    <Plus size={16} />
                    New Window
                </Button>
            </PageHeader>

            <SubmitWindowHero
                status={windowStatus}
                loading={statusLoading}
                refreshing={statusRefreshing}
            />

            <div className="mb-2 flex justify-end">
                <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated p-1">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleFilterChange(option.value)}
                            className={cn(
                                "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all",
                                filter === option.value
                                    ? option.activeClassName
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <Alert>{error}</Alert>}

            {loading && <TableSkeleton rows={6} columns={5} />}

            {!loading && data?.items.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
            )}

            {!loading && data && data.items.length > 0 && (
                <SubmitWindowTable
                    items={data.items}
                    filter={filter}
                    onEdit={modal.openEdit}
                    onDelete={handleDelete}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                />
            )}

            <SubmitWindowFormModal
                key={modal.editing?.id ?? "new"}
                open={modal.open}
                onClose={modal.close}
                onSubmit={handleSubmit}
                initial={modal.editing}
            />
        </PageContainer>
    );
}
