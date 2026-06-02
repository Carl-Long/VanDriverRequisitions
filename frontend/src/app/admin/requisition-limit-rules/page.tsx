"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { SearchInput } from "@/components/ui/search-input";
import { Surface } from "@/components/ui/surface";

import { useToast } from "@/providers/toast-provider";

import { ApiError } from "@/lib/api/client";
import {
    requisitionLimitRulesApi,
    type RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";

import { feTaskTypesApi } from "@/lib/api/fe-task-types";
import type { FeTaskType } from "@/lib/api/fe-task-types";

import { RequisitionLimitRuleTable } from "@/components/requisition-limit-rules/requisition-limit-rule-table";
import { RequisitionLimitRuleFormModal } from "@/components/requisition-limit-rules/requisition-limit-rule-form-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";

export default function RequisitionLimitRulesPage() {
    const [rules, setRules] = useState<RequisitionLimitRuleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [taskTypes, setTaskTypes] = useState<FeTaskType[]>([]);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] =
        useState<RequisitionLimitRuleSummary | null>(null);

    const toast = useToast();

    /* ---------------- load ---------------- */

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await requisitionLimitRulesApi.getAll();
            setRules(data);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.detail ?? err.message);
            } else {
                setError("Failed to load requisition limit rules.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        feTaskTypesApi.getAll(false)
            .then(setTaskTypes)
            .catch(() => {
                toast.error("Failed to load task types");
            });
    }, [toast]);

    /* ---------------- filter ---------------- */

    const filtered = useMemo(() => {
        if (!search.trim()) return rules;

        const q = search.toLowerCase();

        return rules.filter(
            r =>
                r.categoryName.toLowerCase().includes(q) ||
                r.fasciaName.toLowerCase().includes(q) ||
                (r.feTaskTypeName?.toLowerCase().includes(q) ?? false),
        );
    }, [rules, search]);

    /* ---------------- modal handlers ---------------- */

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(rule: RequisitionLimitRuleSummary) {
        setEditing(rule);
        setModalOpen(true);
    }

    /* ---------------- submit ---------------- */

    async function handleSubmit(data: {
        categoryId: number;
        fasciaId: number;
        feTaskTypeId: string | null;
        maxQuantity: number;
        maxRate: number;
    }) {
        const payload = {
            categoryId: data.categoryId,
            fasciaId: data.fasciaId,
            feTaskTypeId: data.feTaskTypeId,
            maxQuantity: data.maxQuantity,
            maxRate: data.maxRate,
        };

        if (editing) {
            await requisitionLimitRulesApi.update(editing.id, payload);
        } else {
            await requisitionLimitRulesApi.create(payload);
        }

        toast.success(
            editing
                ? "Requisition limit rule updated"
                : "Requisition limit rule created",
        );

        setModalOpen(false);
        setEditing(null);

        await load();
    }

    const emptyState =
        search.trim()
            ? {
                icon: Search,
                title: "No rules found",
                description: "Try adjusting your search terms.",
            }
            : {
                icon: SlidersHorizontal,
                title: "No requisition limit rules yet",
                description:
                    "Create your first rule to define limits for requisitions.",
            };

    /* ---------------- UI ---------------- */

    return (
        <PageContainer>
            <PageHeader
                title="Requisition Limit Rules"
                description="Manage requisition quantity and rate limits."
            >
                <Button onClick={openCreate}>
                    <Plus size={16} />
                    New Rule
                </Button>
            </PageHeader>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by category, fascia, or task type..."
                    className="w-full lg:w-[32rem]"
                />
            </div>

            {error && (
                <Surface className="mb-6 border-danger bg-danger/10 px-4 py-3">
                    <p className="text-sm text-danger">{error}</p>
                </Surface>
            )}

            {loading && (
                <TableSkeleton
                    rows={6}
                    columns={7}
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
                <RequisitionLimitRuleTable
                    items={filtered}
                    onEdit={openEdit}
                />
            )}

            <RequisitionLimitRuleFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleSubmit}
                initial={editing} taskTypes={taskTypes} />
        </PageContainer>
    );
}