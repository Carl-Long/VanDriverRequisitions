"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, Plus, Search } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { Surface } from "@/components/ui/surface";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { Toggle } from "@/components/ui/toggle";
import { CostReasonFormModal } from "@/features/cost-reasons/cost-reason-form-modal";
import { CostReasonTable } from "@/features/cost-reasons/cost-reason-table";
import { getApiErrorMessage } from "@/lib/api/client";
import { useCrudModal } from "@/hooks/use-crud-modal";
import { useToast } from "@/providers/toast-provider";
import { CostReason, CreateCostReason } from "@/features/cost-reasons/cost-reason.types";
import { costReasonsApi } from "@/features/cost-reasons/cost-reasons-api";
import { useOptimisticActiveToggle } from "@/features/admin-shared/use-optimistic-active-toggle";

export default function CostReasonsPage() {
    const [reasons, setReasons] = useState<CostReason[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const modal = useCrudModal<CostReason>();

    const toast = useToast();
    const { pendingIds, toggleActive } = useOptimisticActiveToggle({
        setItems: setReasons,
        showInactive,
        activate: costReasonsApi.activate,
        deactivate: costReasonsApi.deactivate,
        afterSuccess: costReasonsApi.clearLookupCache,
        onBeforeToggle: () => setError(null),
        onSuccess: (reason, nextIsActive) => {
            toast.success(
                nextIsActive
                    ? `${reason.code} - ${reason.reason} activated`
                    : `${reason.code} - ${reason.reason} deactivated`,
            );
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, "Failed to update cost reason."));
        },
    });

    const fetchReasons = useCallback(
        () => costReasonsApi.getAll(showInactive),
        [showInactive],
    );

    useEffect(() => {
        let cancelled = false;

        fetchReasons()
            .then((data) => {
                if (!cancelled) {
                    setReasons(data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, "Failed to load cost reasons."));
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [fetchReasons]);
    
    async function reloadReasons() {
        setLoading(true);
        setError(null);
        await fetchReasons();
    }

    function handleIncludeInactiveChange() {
        setLoading(true);
        setError(null);
        setShowInactive((active) => !active);
    }

    const filtered = useMemo(() => {
        if (!search.trim()) return reasons;

        const query = search.toLowerCase();

        return reasons.filter((reason) => {
            return (
                reason.code.toLowerCase().includes(query) ||
                reason.reason.toLowerCase().includes(query) ||
                reason.scope.toLowerCase().includes(query)
            );
        });
    }, [reasons, search]);

    async function handleSubmit(data: CreateCostReason) {
        if (modal.editing) {
            await costReasonsApi.update(modal.editing.id, data);
        } else {
            await costReasonsApi.create(data);
        }

        costReasonsApi.clearLookupCache();

        toast.success(
            modal.editing
                ? `Cost reason "${data.code} - ${data.reason}" updated`
                : `Cost reason "${data.code} - ${data.reason}" created`,
        );

        modal.close();
        await reloadReasons();
    }

    const emptyState = search.trim()
        ? {
            icon: Search,
            title: "No cost reasons found",
            description: "Try adjusting your search terms.",
        }
        : {
            icon: MessageSquare,
            title: "No cost reasons yet",
            description: "Create your first cost reason to get started.",
        };

    return (
        <PageContainer>
            <PageHeader
                title="Cost Reasons"
                description="Manage additional cost reason codes for FE, STD, or shared requisition use."
            >
                <Button onClick={modal.openCreate}>
                    <Plus className="size-[1em]" />
                    New Cost Reason
                </Button>
            </PageHeader>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by code, reason, or scope..."
                    className="w-full lg:w-[32rem]"
                />

                <Surface className="flex w-fit self-end items-center gap-3 px-4 py-2 lg:ml-auto lg:self-auto">
                    <span className="text-sm text-muted-foreground">Include inactive</span>

                    <Toggle
                        checked={showInactive}
                        onChange={handleIncludeInactiveChange}
                        ariaLabel="Toggle inactive cost reasons"
                    />
                </Surface>
            </div>

            {error && <Alert>{error}</Alert>}

            {loading && <TableSkeleton rows={6} columns={6} />}

            {!loading && filtered.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
            )}

            {!loading && filtered.length > 0 && (
                <CostReasonTable
                    items={filtered}
                    pendingIds={pendingIds}
                    onEdit={modal.openEdit}
                    onToggleActive={toggleActive}
                />
            )}

            <CostReasonFormModal
                key={modal.editing?.id ?? "new"}
                open={modal.open}
                onClose={modal.close}
                onSubmit={handleSubmit}
                initial={modal.editing}
            />
        </PageContainer>
    );
}