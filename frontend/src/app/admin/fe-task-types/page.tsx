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

import { TaskTypeTable } from "@/components/fe-task-types/task-type-table";
import { TaskTypeFormModal } from "@/components/fe-task-types/task-type-form-modal";

import {
    feTaskTypesApi,
    type FeTaskType,
} from "@/lib/api/fe-task-types";

import { ApiError } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";

export default function FeTaskTypesPage() {
    const [taskTypes, setTaskTypes] = useState<FeTaskType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<FeTaskType | null>(null);

    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await feTaskTypesApi.getAll(showInactive);
            setTaskTypes(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.detail ?? err.message);
            } else {
                setError("Failed to load task types.");
            }
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return taskTypes;

        const query = search.toLowerCase();

        return taskTypes.filter(
            (t) => t.name.toLowerCase().includes(query) || t.code.toLowerCase().includes(query),
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
    }) {
        if (editing) {
            await feTaskTypesApi.update(editing.id, data);
        } else {
            await feTaskTypesApi.create(data);
        }
        toast.success(editing ? `Task type "${data.name}" updated` : `Task type "${data.name}" created`);
        await load();
    }

    async function handleToggleActive(taskType: FeTaskType) {
        try {
            if (taskType.isActive) {
                await feTaskTypesApi.deactivate(taskType.id);
            } else {
                await feTaskTypesApi.activate(taskType.id);
            }
            toast.success(taskType.isActive ? `${taskType.name} deactivated` : `${taskType.name} activated`);
            await load();
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.detail ?? err.message);
            } else {
                setError("Failed to update task type.");
            }
        }
    }

    return (
        <PageContainer>
            <PageHeader
                title="FE Task Types"
                description="Manage FE task type codes."
            >
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    New Task Type
                </Button>
            </PageHeader>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or code..."
                    className="w-full lg:w-[32rem]"
                />

                <Surface className="flex items-center gap-3 px-4 py-2">
                    <span className="text-sm text-muted-foreground">
                        Show inactive
                    </span>



                    <Toggle
                        checked={showInactive}
                        onChange={() =>
                            setShowInactive((v) => !v)
                        }
                        ariaLabel="Toggle inactive task types"
                    />
                </Surface>
            </div>

            {error && (
                <Surface className="mb-6 border-destructive bg-destructive/10 px-4 py-3">
                    <p className="text-sm text-destructive">
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
                            ? "No task types match your search."
                            : "No task types yet. Create one to get started."}
                    </p>

                    {!search && (
                        <div className="mt-4">
                            <IconButton onClick={openCreate}>
                                <Plus size={14} />
                                Create Task Type
                            </IconButton>
                        </div>
                    )}
                </Surface>
            )}

            {!loading && filtered.length > 0 && (
                <TaskTypeTable
                    items={filtered}
                    onEdit={openEdit}
                    onToggleActive={handleToggleActive}
                />
            )}

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