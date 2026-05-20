"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { LimitValueCard } from "@/components/limit-values/limit-value-card";
import { LimitValueFormModal } from "@/components/limit-values/limit-value-form-modal";
import { limitValuesApi, type LimitValue } from "@/lib/api/limit-values";

export default function LimitValuesPage() {
    const [limitValues, setLimitValues] = useState<LimitValue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<LimitValue | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await limitValuesApi.getAll(showInactive);
            setLimitValues(data);
        } catch {
            setError("Failed to load limit values. Is the API running?");
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return limitValues;
        const q = search.toLowerCase();
        return limitValues.filter(
            (lv) =>
                lv.title.toLowerCase().includes(q) ||
                lv.nameOfValue.toLowerCase().includes(q),
        );
    }, [limitValues, search]);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(limitValue: LimitValue) {
        setEditing(limitValue);
        setModalOpen(true);
    }

    async function handleSubmit(data: {
        title: string;
        nameOfValue: string;
        fascia: number | null;
        typeOfLimitation: number;
        numericalLimit: number | null;
        currencyLimit: number | null;
    }) {
        if (editing) {
            await limitValuesApi.update(editing.id, data);
        } else {
            await limitValuesApi.create(data);
        }
        setModalOpen(false);
        setEditing(null);
        await load();
    }

    async function handleToggleActive(limitValue: LimitValue) {
        try {
            if (limitValue.isActive) {
                await limitValuesApi.deactivate(limitValue.id);
            } else {
                await limitValuesApi.activate(limitValue.id);
            }
            await load();
        } catch {
            setError("Failed to update status.");
        }
    }

    return (
        <PageContainer>
            <PageHeader
                title="Limit Values"
                description="Manage numerical and currency limits applied across requisitions."
            >
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    New Limit Value
                </Button>
            </PageHeader>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by title or name..."
                    className="sm:max-w-xs"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-primary"
                    />
                    Show inactive
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
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className="h-44 animate-pulse rounded-2xl border border-border bg-surface"
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-sm text-muted-foreground">
                        {search
                            ? "No limit values match your search."
                            : "No limit values yet. Create one to get started."}
                    </p>
                </div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((lv) => (
                        <LimitValueCard
                            key={lv.id}
                            limitValue={lv}
                            onEdit={openEdit}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            {/* Form modal */}
            <LimitValueFormModal
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
