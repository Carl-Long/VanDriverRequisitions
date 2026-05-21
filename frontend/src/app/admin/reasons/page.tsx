"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button/button";
import { ReasonCard } from "@/components/fe-reasons/reason-card";
import { ReasonFormModal } from "@/components/fe-reasons/reason-form-modal";
import {
    feReasonsApi,
    type FeReason,
} from "@/lib/api/fe-reasons";

export default function FeReasonsPage() {
    const [reasons, setReasons] = useState<FeReason[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FeReason | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await feReasonsApi.getAll(showInactive);
            setReasons(data);
        } catch {
            setError("Failed to load reasons. Is the API running?");
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return reasons;
        const q = search.toLowerCase();
        return reasons.filter((r) => r.reason.toLowerCase().includes(q));
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
        setModalOpen(false);
        setEditing(null);
        await load();
    }

    async function handleToggleActive(reason: FeReason) {
        try {
            if (reason.isActive) {
                await feReasonsApi.deactivate(reason.id);
            } else {
                await feReasonsApi.activate(reason.id);
            }
            await load();
        } catch {
            setError("Failed to update status.");
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

            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by reason..."
                    className="sm:max-w-xs"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>Show inactive</span>
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
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {["a", "b", "c", "d", "e", "f"].map((key) => (
                        <div
                            key={`skeleton-${key}`}
                            className="h-36 animate-pulse rounded-2xl border border-border bg-surface"
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-sm text-muted-foreground">
                        {search
                            ? "No reasons match your search."
                            : "No reasons yet. Create one to get started."}
                    </p>
                </div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((reason) => (
                        <ReasonCard
                            key={reason.id}
                            reason={reason}
                            onEdit={openEdit}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            {/* Form modal */}
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
