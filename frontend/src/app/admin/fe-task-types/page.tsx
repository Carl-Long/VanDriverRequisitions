"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { TaskTypeCard } from "@/components/fe-task-types/task-type-card";
import { TaskTypeFormModal } from "@/components/fe-task-types/task-type-form-modal";
import {
    feTaskTypesApi,
    type FeTaskType,
} from "@/lib/api/fe-task-types";

export default function FeTaskTypesPage() {
    const [taskTypes, setTaskTypes] = useState<FeTaskType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FeTaskType | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await feTaskTypesApi.getAll(showInactive);
            setTaskTypes(data);
        } catch {
            setError("Failed to load task types. Is the API running?");
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return taskTypes;
        const q = search.toLowerCase();
        return taskTypes.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.code.toLowerCase().includes(q),
        );
    }, [taskTypes, search]);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(taskType: FeTaskType) {
        setEditing(taskType);
        setModalOpen(true);
    }

    async function handleSubmit(data: { name: string; code: string }) {
        if (editing) {
            await feTaskTypesApi.update(editing.id, data);
        } else {
            await feTaskTypesApi.create(data);
        }
        setModalOpen(false);
        setEditing(null);
        await load();
    }

    async function handleToggleActive(taskType: FeTaskType) {
        try {
            if (taskType.isActive) {
                await feTaskTypesApi.deactivate(taskType.id);
            } else {
                await feTaskTypesApi.activate(taskType.id);
            }
            await load();
        } catch {
            setError("Failed to update status.");
        }
    }

    return (
        <PageContainer>
            <PageHeader
                title="FE Task Types"
                description="Manage task type codes used across FE store requisitions."
            >
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    New Task Type
                </Button>
            </PageHeader>

            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or code..."
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
                            className="h-40 animate-pulse rounded-2xl border border-border bg-surface"
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-sm text-muted-foreground">
                        {search
                            ? "No task types match your search."
                            : "No task types yet. Create one to get started."}
                    </p>
                </div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((taskType) => (
                        <TaskTypeCard
                            key={taskType.id}
                            taskType={taskType}
                            onEdit={openEdit}
                            onToggleActive={handleToggleActive}
                        />
                    ))}
                </div>
            )}

            {/* Form modal */}
            <TaskTypeFormModal
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
