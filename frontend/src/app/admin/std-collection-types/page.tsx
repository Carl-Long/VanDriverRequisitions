"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ListChecks, Plus, Search } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Surface } from "@/components/ui/surface";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { Toggle } from "@/components/ui/toggle";
import { useCrudModal } from "@/hooks/use-crud-modal";
import { getApiErrorMessage } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";
import { stdCollectionTypesApi, type CreateStdCollectionType, type StdCollectionType, } from "@/features/std-collection-types/std-collection-types-api";
import { StdCollectionTypeFormModal } from "@/features/std-collection-types/std-collection-type-form-modal";
import { StdCollectionTypeTable } from "@/features/std-collection-types/std-collection-type-table";
import { useOptimisticActiveToggle } from "@/features/admin-shared/use-optimistic-active-toggle";

export default function StdCollectionTypesPage() {
    const [collectionTypes, setCollectionTypes] = useState<StdCollectionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);

    const modal = useCrudModal<StdCollectionType>();
    const toast = useToast();

    const { pendingIds, toggleActive } = useOptimisticActiveToggle({
        setItems: setCollectionTypes,
        showInactive,
        activate: stdCollectionTypesApi.activate,
        deactivate: stdCollectionTypesApi.deactivate,
        afterSuccess: stdCollectionTypesApi.clearCache,
        onBeforeToggle: () => setError(null),
        onSuccess: (collectionType, nextIsActive) => {
            toast.success(
                nextIsActive
                    ? `${collectionType.code} - ${collectionType.name} activated`
                    : `${collectionType.code} - ${collectionType.name} deactivated`,
            );
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, "Failed to update STD collection type."));
        },
    });
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await stdCollectionTypesApi.getAll(showInactive);
            setCollectionTypes(data);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to load STD collection types."));
        } finally {
            setLoading(false);
        }
    }, [showInactive]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        if (!search.trim()) return collectionTypes;

        const query = search.toLowerCase();

        return collectionTypes.filter(
            (item) =>
                item.code.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query),
        );
    }, [collectionTypes, search]);

    async function handleSubmit(data: CreateStdCollectionType) {
        if (modal.editing) {
            await stdCollectionTypesApi.update(modal.editing.id, data);
        } else {
            await stdCollectionTypesApi.create(data);
        }

        stdCollectionTypesApi.clearCache();

        toast.success(
            modal.editing
                ? `STD collection type "${data.code} - ${data.name}" updated`
                : `STD collection type "${data.code} - ${data.name}" created`,
        );

        modal.close();
        await load();
    }

    const emptyState = search.trim()
        ? {
            icon: Search,
            title: "No STD collection types found",
            description: "Try adjusting your search terms.",
        }
        : {
            icon: ListChecks,
            title: "No STD collection types yet",
            description: "Create your first STD collection type to get started.",
        };

    return (
        <PageContainer>
            <PageHeader
                title="STD Collection Types"
                description="Manage STD collection type codes used by Banks & Bins collection rows."
            >
                <Button onClick={modal.openCreate}>
                    <Plus className="size-[1em]" />
                    New Collection Type
                </Button>
            </PageHeader>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by code or name..."
                    className="w-full lg:w-[32rem]"
                />

                <Surface className="flex w-fit self-end items-center gap-3 px-4 py-2 lg:ml-auto lg:self-auto">
                    <span className="text-sm text-muted-foreground">Include inactive</span>

                    <Toggle
                        checked={showInactive}
                        onChange={() => setShowInactive((active) => !active)}
                        ariaLabel="Toggle inactive STD collection types"
                    />
                </Surface>
            </div>

            {error && <Alert>{error}</Alert>}

            {loading && <TableSkeleton rows={6} columns={5} />}

            {!loading && filtered.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
            )}

            {!loading && filtered.length > 0 && (
                <StdCollectionTypeTable
                    items={filtered}
                    pendingIds={pendingIds}
                    onEdit={modal.openEdit}
                    onToggleActive={toggleActive}
                />
            )}

            <StdCollectionTypeFormModal
                key={modal.editing?.id ?? "new"}
                open={modal.open}
                onClose={modal.close}
                onSubmit={handleSubmit}
                initial={modal.editing}
            />
        </PageContainer>
    );
}