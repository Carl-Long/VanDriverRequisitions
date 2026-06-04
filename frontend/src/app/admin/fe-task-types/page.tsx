"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { SearchInput } from "@/components/ui/search-input";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";

import { TaskTypeTable } from "@/components/fe-task-types/task-type-table";
import { TaskTypeFormModal } from "@/components/fe-task-types/task-type-form-modal";

import {
    feTaskTypesApi,
    type FeTaskType,
} from "@/lib/api/fe-task-types";

import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { Alert } from "@/components/ui/alert";

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
            setError(
                getApiErrorMessage(
                    err,
                    "Failed to load task types limit rules.",
                ),
            );
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

    async function handleSubmit(data: { name: string; code: string; }) {
        if (editing) {
            await feTaskTypesApi.update(editing.id, data);
        } else {
            await feTaskTypesApi.create(data);
        }

        toast.success(
            editing
                ? `Task type "${data.name}" updated`
                : `Task type "${data.name}" created`
        );

        setModalOpen(false);
        setEditing(null);

        load();
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
            setError(
                getApiErrorMessage(
                    err,
                    "Failed update task type",
                ),
            );
        }
    }

    const emptyState =
        search.trim()
            ? {
                icon: Search,
                title: "No task types found",
                description: "Try adjusting your search terms.",
            }
            : {
                icon: Plus,
                title: "No task types yet",
                description: "Create your first task type to get started.",
            };

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

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or code..."
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
                        ariaLabel="Toggle inactive task types"
                    />
                </Surface>
            </div>

            {error && (
                <Alert>
                    {error}
                </Alert>
            )}

            {loading && (
                <TableSkeleton
                    rows={6}
                    columns={5}
                />
            )}

            {!loading && filtered.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
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