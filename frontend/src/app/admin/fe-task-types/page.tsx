"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";

import { TaskTypeTable } from "@/components/fe-task-types/task-type-table";
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

    async function handleSubmit(data: {
        name: string;
        code: string;
        dailyQuantityLimitId: string | null;
        rateLimitId: string | null;
    }) {
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
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or code..."
                    className="w-full lg:w-[32rem]"
                />

                {/* Modern Active / All Toggle */}
                <div className="inline-flex rounded-lg bg-surface p-1">
                    <button
                        type="button"
                        onClick={() => setShowInactive(false)}
                        className={[
                            "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            showInactive
                                ? "text-muted-foreground hover:text-foreground"
                                : "bg-secondary text-secondary-foreground",
                        ].join(" ")}
                    >
                        Active
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowInactive(true)}
                        className={[
                            "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            showInactive
                                ? "bg-secondary text-secondary-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                    >
                        All
                    </button>
                </div>
            </div>
            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    <div className="h-10 animate-pulse rounded bg-muted" />
                    <div className="h-10 animate-pulse rounded bg-muted" />
                    <div className="h-10 animate-pulse rounded bg-muted" />
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="py-16 text-center text-sm text-muted-foreground">
                    {search
                        ? "No task types match your search."
                        : "No task types yet. Create one to get started."}
                </div>
            )}

            {/* Table */}
            {!loading && filtered.length > 0 && (
                <TaskTypeTable
                    items={filtered}
                    onEdit={openEdit}
                    onToggleActive={handleToggleActive}
                />
            )}

            {/* Modal */}
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