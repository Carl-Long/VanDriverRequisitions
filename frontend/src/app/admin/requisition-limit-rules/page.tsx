"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/providers/toast-provider";
import { getApiErrorMessage } from "@/lib/api/client";
import { feTaskTypesApi } from "@/features/fe-task-types/fe-task-types-api";
import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { Alert } from "@/components/ui/alert";
import { RequisitionLimitRuleFormModal } from "@/features/requisition-limit-rules/requisition-limit-rule-form-modal";
import { RequisitionLimitRuleTable } from "@/features/requisition-limit-rules/requisition-limit-rule-table";
import {
    RequisitionLimitRuleSummary,
    requisitionLimitRulesApi,
} from "@/features/requisition-limit-rules/requisition-limit-rules-api";

export default function RequisitionLimitRulesPage() {
    const [rules, setRules] = useState<RequisitionLimitRuleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [taskTypes, setTaskTypes] = useState<FeTaskType[]>([]);
    const [taskTypeError, setTaskTypeError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<RequisitionLimitRuleSummary | null>(null);
    const toast = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await requisitionLimitRulesApi.getAll();
            setRules(data);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to load submit windows."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        async function loadTaskTypes() {
            try {
                setTaskTypeError(null);
                const data = await feTaskTypesApi.getAll(false);
                setTaskTypes(data);
            } catch (err) {
                setTaskTypeError(getApiErrorMessage(err, "Failed to load task types."));
            }
        }
        loadTaskTypes();
    }, []);

    const fasciaOrder: Record<string, number> = {
        FE: 0,
        STD: 1,
    };

    const categoryOrder: Record<string, number> = {
        "General Task": 0,
        Mileage: 1,
        Transfer: 2,
        "Additional Cost": 3,
    };

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        const results = query
            ? rules.filter(
                  (rule) =>
                      rule.categoryName.toLowerCase().includes(query) ||
                      rule.fasciaName.toLowerCase().includes(query) ||
                      (rule.feTaskTypeName?.toLowerCase().includes(query) ?? false),
              )
            : rules;

        return [...results].sort((a, b) => {
            const fasciaCompare =
                (fasciaOrder[a.fasciaName] ?? 999) - (fasciaOrder[b.fasciaName] ?? 999);

            if (fasciaCompare !== 0) {
                return fasciaCompare;
            }

            const categoryCompare =
                (categoryOrder[a.categoryName] ?? 999) - (categoryOrder[b.categoryName] ?? 999);

            if (categoryCompare !== 0) {
                return categoryCompare;
            }

            return (a.feTaskTypeName ?? "").localeCompare(b.feTaskTypeName ?? "");
        });
    }, [rules, search]);

    function openCreate() {
        setEditing(null);
        setModalOpen(true);
    }

    function openEdit(rule: RequisitionLimitRuleSummary) {
        setEditing(rule);
        setModalOpen(true);
    }

    async function handleSubmit(data: {
        category: number;
        fascia: number;
        feTaskTypeId: string | null;
        maxQuantity: number;
        maxRate: number;
    }) {
        if (editing) {
            await requisitionLimitRulesApi.update(editing.id, data);
        } else {
            await requisitionLimitRulesApi.create(data);
        }

        toast.success(
            editing ? "Requisition limit rule updated" : "Requisition limit rule created",
        );
        setModalOpen(false);
        setEditing(null);
        await load();
    }

    const emptyState = search.trim()
        ? {
              icon: Search,
              title: "No rules found",
              description: "Try adjusting your search terms.",
          }
        : {
              icon: SlidersHorizontal,
              title: "No requisition limit rules yet",
              description: "Create your first rule to define limits for requisitions.",
          };

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

            {error && <Alert>{error}</Alert>}

            {taskTypeError && <Alert>{taskTypeError}</Alert>}

            {loading && <TableSkeleton rows={6} columns={7} />}

            {!loading && filtered.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
            )}

            {!loading && filtered.length > 0 && (
                <RequisitionLimitRuleTable items={filtered} onEdit={openEdit} />
            )}

            <RequisitionLimitRuleFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditing(null);
                }}
                onSubmit={handleSubmit}
                initial={editing}
                taskTypes={taskTypes}
            />
        </PageContainer>
    );
}
