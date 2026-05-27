"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarX, Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { Surface } from "@/components/ui/surface";

import { SubmitWindowHero } from "@/components/submit-windows/submit-window-hero";
import { SubmitWindowFormModal } from "@/components/submit-windows/submit-window-form-modal";
import { SubmitWindowTable } from "@/components/submit-windows/submit-window-table";

import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";

import {
    SubmitWindowFilter,
    submitWindowsApi,
    type SubmitWindow,
} from "@/lib/api/submit-windows";

import type { PagedResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { EmptyState } from "@/components/ui/empty-state";

const PAGE_SIZE = 10;

export default function SubmitWindowsPage() {
    const [data, setData] =
        useState<PagedResult<SubmitWindow> | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<SubmitWindowFilter>("active");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] =
        useState<SubmitWindow | null>(null);

    // Hero status
    const {
        status: windowStatus,
        loading: statusLoading,
        refresh: refreshStatus,
    } = useSubmitWindowStatus();

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
                    description:
                        "Once submit windows close, they will appear here.",
                };

            case "deleted":
                return {
                    icon: CalendarX,
                    title: "No deleted submit windows",
                    description:
                        "Deleted submit windows will appear here.",
                };

            default:
                return {
                    icon: CalendarX,
                    title: "No submit windows",
                    description: "No submit windows found.",
                };
        }
    })();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result =
                await submitWindowsApi.getAll(
                    page,
                    PAGE_SIZE,
                    filter,
                );

            setData(result);
        } catch {
            setError(
                "Failed to load submit windows. Is the API running?",
            );
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        load();
    }, [load]);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(1);
    }, [filter]);

    const toast = useToast();

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(window: SubmitWindow) {
        setEditing(window);
        setModalOpen(true);
    }

    async function handleSubmit(data: {
        openFrom: string;
        openTo: string;
    }) {

        if (editing) {
            await submitWindowsApi.update(editing.id, data);
            toast.success(`Submit window updated`);
        } else {
            await submitWindowsApi.create(data);
            toast.success(`Submit window created`);
        }

        setModalOpen(false);
        setEditing(null);

        await load();
        await refreshStatus();
    }

    async function handleDelete(window: SubmitWindow) {
        try {
            await submitWindowsApi.delete(window.id);

            toast.success("Submit window deleted");

            await load();
            await refreshStatus();
        } catch {
            setError("Failed to delete submit window.");
        }
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
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    New Window
                </Button>
            </PageHeader>

            <SubmitWindowHero
                status={windowStatus}
                loading={statusLoading}
            />

            <div className="mb-2 flex justify-end">
                <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface-elevated p-1">
                    <button
                        type="button"
                        onClick={() => setFilter("active")}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                            filter === "active"
                                ? "bg-success/20 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        Current & Upcoming
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("past")}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                            filter === "past"
                                ? "bg-accent/20 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        Completed
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilter("deleted")}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                            filter === "deleted"
                                ? "bg-danger/20 text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        Deleted
                    </button>
                </div>
            </div>

            {/* Error */}
            {
                error && (
                    <Surface className="mb-6 border-danger-border bg-danger-surface px-4 py-3">
                        <p className="text-sm text-danger">
                            {error}
                        </p>
                    </Surface>
                )
            }

            {/* Loading */}
            {
                loading && (
                    <div className="space-y-3">
                        <Surface className="h-10 animate-pulse bg-surface-subtle" />
                        <Surface className="h-10 animate-pulse bg-surface-subtle" />
                        <Surface className="h-10 animate-pulse bg-surface-subtle" />
                    </div>
                )
            }

            {/* Empty state */}

            {!loading && data?.items.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
            )}

            {/* Table */}
            {
                !loading &&
                data &&
                data.items.length > 0 && (
                    <SubmitWindowTable
                        items={data.items}
                        filter={filter}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
                )
            }

            {/* Pagination */}
            {
                data && data.totalPages > 1 && (
                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        onPageChange={handlePageChange}
                        className="mt-6"
                    />
                )
            }

            {/* Modal */}
            <SubmitWindowFormModal
                key={editing?.id ?? "new"}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleSubmit}
                initial={editing}
            />
        </PageContainer >
    );
}