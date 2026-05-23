"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";

import { SubmitWindowHero } from "@/components/submit-windows/submit-window-hero";
import { SubmitWindowFormModal } from "@/components/submit-windows/submit-window-form-modal";
import { SubmitWindowTable } from "@/components/submit-windows/submit-window-table";

import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";

import {
    submitWindowsApi,
    type SubmitWindow,
} from "@/lib/api/submit-windows";

import type { PagedResult } from "@/lib/types";

const PAGE_SIZE = 10;

export default function SubmitWindowsPage() {
    const [data, setData] =
        useState<PagedResult<SubmitWindow> | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [showDeleted, setShowDeleted] = useState(false);

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

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result =
                await submitWindowsApi.getAll(
                    page,
                    PAGE_SIZE,
                    showDeleted,
                );

            setData(result);
        } catch {
            setError(
                "Failed to load submit windows. Is the API running?",
            );
        } finally {
            setLoading(false);
        }
    }, [page, showDeleted]);

    useEffect(() => {
        load();
    }, [load]);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(1);
    }, [showDeleted]);

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
            await submitWindowsApi.update(
                editing.id,
                data,
            );
        } else {
            await submitWindowsApi.create(data);
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
    onCreateClick={openCreate}
/>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-muted-foreground">
                    {data && !loading
                        ? `${data.totalCount} window${
                              data.totalCount === 1
                                  ? ""
                                  : "s"
                          }`
                        : "\u00A0"}
                </p>

                <Surface className="flex w-fit items-center gap-3 px-4 py-2">
                    <span className="text-sm text-muted-foreground">
                        Show deleted
                    </span>

                    <Toggle
                        checked={showDeleted}
                        onChange={() =>
                            setShowDeleted(
                                (prev) => !prev,
                            )
                        }
                        ariaLabel="Toggle deleted submit windows"
                    />
                </Surface>
            </div>

            {/* Error */}
            {error && (
                <Surface className="mb-6 border-destructive bg-destructive/10 px-4 py-3">
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                </Surface>
            )}

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    <Surface className="h-10 animate-pulse bg-surface-hover" />
                    <Surface className="h-10 animate-pulse bg-surface-hover" />
                    <Surface className="h-10 animate-pulse bg-surface-hover" />
                </div>
            )}

            {/* Empty state */}
            {!loading &&
                data?.items.length === 0 && (
                    <Surface className="py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                            No submit windows yet.
                            Create one to get started.
                        </p>
                    </Surface>
                )}

            {/* Table */}
            {!loading &&
                data &&
                data.items.length > 0 && (
                    <SubmitWindowTable
                        items={data.items}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                    />
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
        </PageContainer>
    );
}