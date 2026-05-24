"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";

import { ReasonFormModal } from "@/components/fe-reasons/reason-form-modal";

import {
    feReasonsApi,
    type FeReason,
} from "@/lib/api/fe-reasons";

import { ApiError } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";
import { FeReasonsTable } from "@/components/fe-reasons/reason-table";

export default function FeReasonsPage() {
    const [reasons, setReasons] = useState<FeReason[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FeReason | null>(null);

    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await feReasonsApi.getAll(showInactive);
            setReasons(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.detail ?? err.message);
            } else {
                setError("Failed to load reasons.");
            }
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return reasons;

        const query = search.toLowerCase();

        return reasons.filter((r) =>
            r.reason.toLowerCase().includes(query),
        );
    }, [reasons, search]);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(reason: FeReason) {
        setEditing(reason);
        setModalOpen(true);
    }

    async function handleSubmit(data: { reason: string }) {
        if (editing) {
            await feReasonsApi.update(editing.id, data);
        } else {
            await feReasonsApi.create(data);
        }

        toast.success(
            editing
                ? `Reason "${data.reason}" updated`
                : `Reason "${data.reason}" created`,
        );

        await load();
    }

    async function handleToggleActive(reason: FeReason) {
        try {
            if (reason.isActive) {
                await feReasonsApi.deactivate(reason.id);
            } else {
                await feReasonsApi.activate(reason.id);
            }

            toast.success(reason.isActive
                ? `${reason.reason} deactivated`
                : `${reason.reason} activated`,
            );

            await load();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.detail ?? err.message);
            } else {
                setError("Failed to update reason.");
            }
        }
    }

    return (
        <PageContainer>
            <PageHeader
                title="FE Reasons"
                description="Manage reason codes used across FE store requisitions."
            >
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    New Reason
                </Button>
            </PageHeader>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by reason..."
                    className="w-full lg:w-[32rem]"
                />

                <Surface className="flex w-fit self-end items-center gap-3 px-4 py-2 lg:ml-auto lg:self-auto">
                    <span className="text-sm text-muted-foreground">
                        Include inactive
                    </span>

                    <Toggle
                        checked={showInactive}
                        onChange={() =>
                            setShowInactive((active) => !active)
                        }
                        ariaLabel="Toggle inactive reasons"
                    />
                </Surface>
            </div>

            {error && (
                <Surface className="mb-6 border-danger bg-danger/10 px-4 py-3">
                    <p className="text-sm text-danger">
                        {error}
                    </p>
                </Surface>
            )}

            {loading && (
                <div className="space-y-3">
                    <Surface className="h-10 animate-pulse bg-surface-hover" />
                    <Surface className="h-10 animate-pulse bg-surface-hover" />
                    <Surface className="h-10 animate-pulse bg-surface-hover" />
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <Surface className="py-16 text-center">
                    <p className="text-sm text-muted-foreground">
                        {search
                            ? "No reasons match your search."
                            : "No reasons yet. Create one to get started."}
                    </p>

                    {!search && (
                        <div className="mt-4">
                            <IconButton onClick={openCreate}>
                                <Plus size={14} />
                                Create Reason
                            </IconButton>
                        </div>
                    )}
                </Surface>
            )}

            {!loading && filtered.length > 0 && (
                <FeReasonsTable
                    items={filtered}
                    onEdit={openEdit}
                    onToggleActive={handleToggleActive}
                />
            )}

            <ReasonFormModal
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