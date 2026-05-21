"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { SubmitWindowFormModal } from "@/components/submit-windows/submit-window-form-modal";
import { SubmitWindowHero } from "@/components/submit-windows/submit-window-hero";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";
import {
    submitWindowsApi,
    type SubmitWindow,
} from "@/lib/api/submit-windows";
import type { PagedResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type WindowStatus = "upcoming" | "open" | "closed" | "deleted";

function getWindowStatus(window: SubmitWindow): WindowStatus {
    if (window.isDeleted) return "deleted";
    const now = new Date();
    const from = new Date(window.openFrom);
    const to = new Date(window.openTo);
    if (now < from) return "upcoming";
    if (now >= from && now <= to) return "open";
    return "closed";
}

const statusConfig: Record<WindowStatus, { label: string; className: string }> = {
    upcoming: {
        label: "Upcoming",
        className: "bg-blue-500/10 text-blue-600",
    },
    open: {
        label: "Open",
        className: "bg-emerald-500/10 text-emerald-600",
    },
    closed: {
        label: "Closed",
        className: "bg-muted text-muted-foreground",
    },
    deleted: {
        label: "Deleted",
        className: "bg-red-500/10 text-red-600",
    },
};

function StatusPill({ status }: Readonly<{ status: WindowStatus }>) {
    const config = statusConfig[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const PAGE_SIZE = 10;

export default function SubmitWindowsPage() {
    const [data, setData] = useState<PagedResult<SubmitWindow> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [showDeleted, setShowDeleted] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<SubmitWindow | null>(null);

    // Submit window status for hero
    const { status: windowStatus, loading: statusLoading, refresh: refreshStatus } = useSubmitWindowStatus();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await submitWindowsApi.getAll(page, PAGE_SIZE, showDeleted);
            setData(result);
        } catch {
            setError("Failed to load submit windows. Is the API running?");
        } finally {
            setLoading(false);
        }
    }, [page, showDeleted]);

    useEffect(() => {
        load();
    }, [load]);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(window: SubmitWindow) {
        setEditing(window);
        setModalOpen(true);
    }

    async function handleSubmit(formData: { openFrom: string; openTo: string }) {
        if (editing) {
            await submitWindowsApi.update(editing.id, formData);
        } else {
            await submitWindowsApi.create(formData);
        }
        setModalOpen(false);
        setEditing(null);
        await load();
        await refreshStatus();
    }

    async function handleDelete(window: SubmitWindow) {
        try {
            await submitWindowsApi.delete(window.id);
            await load();
            await refreshStatus();
        } catch {
            setError("Failed to delete submit window.");
        }
    }

    async function handleRestore(window: SubmitWindow) {
        try {
            await submitWindowsApi.restore(window.id);
            await load();
            await refreshStatus();
        } catch {
            setError("Failed to restore submit window.");
        }
    }

    function handlePageChange(newPage: number) {
        setPage(newPage);
    }

    // Reset to page 1 when toggling deleted filter
    useEffect(() => {
        setPage(1);
    }, [showDeleted]);

    return (
        <PageContainer>
            <PageHeader
                title="Submit Windows"
                description="Manage the time windows during which requisitions can be submitted."
            >
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    <span>New Window</span>
                </Button>
            </PageHeader>

            <SubmitWindowHero
                status={windowStatus}
                loading={statusLoading}
                onCreateClick={openCreate}
            />

            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {data && !loading
                        ? `${data.totalCount} window${data.totalCount === 1 ? "" : "s"}`
                        : "\u00A0"}
                </p>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={showDeleted}
                        onChange={(e) => setShowDeleted(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>Show deleted</span>
                </label>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="overflow-hidden rounded-xl border border-border">
                    {["a", "b", "c", "d", "e"].map((key) => (
                        <div
                            key={`skeleton-${key}`}
                            className="h-14 animate-pulse border-b border-border bg-surface last:border-b-0"
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && data && data.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-sm text-muted-foreground">
                        No submit windows yet. Create one to get started.
                    </p>
                </div>
            )}

            {/* Table */}
            {!loading && data && data.items.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Open From
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Open To
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Created By
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((sw) => {
                                const status = getWindowStatus(sw);
                                return (
                                    <tr
                                        key={sw.id}
                                        className={cn(
                                            "border-b border-border last:border-b-0 transition-colors",
                                            sw.isDeleted
                                                ? "bg-red-500/5 opacity-60"
                                                : "bg-surface hover:bg-muted/30",
                                        )}
                                    >
                                        <td className="px-4 py-3 text-foreground">
                                            {formatDateTime(sw.openFrom)}
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            {formatDateTime(sw.openTo)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill status={status} />
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {sw.createdByNameSnapshot || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {sw.isDeleted ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRestore(sw)
                                                        }
                                                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/10"
                                                        title="Restore"
                                                    >
                                                        <RotateCcw size={14} />
                                                        <span>Restore</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(sw)
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={14}
                                                            />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(sw)
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-500/10"
                                                            title="Delete"
                                                        >
                                                            <Trash2
                                                                size={14}
                                                            />
                                                            <span>Delete</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                />
            )}

            {/* Form modal */}
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
        </PageContainer>
    );
}
