"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { Surface } from "@/components/ui/surface";

import { ApiError } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";
import { RequisitionLimitRuleTable } from "@/components/requisition-limit-rules/requisition-limit-rule-table";
import { RequisitionLimitRuleSummary, requisitionLimitRulesApi } from "@/lib/api/requisition-limit-rules";

export default function RequisitionLimitRulesPage() {
    const [rules, setRules] = useState<RequisitionLimitRuleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] =
        useState<RequisitionLimitRuleSummary | null>(null);

    const toast = useToast();

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

    const filtered = useMemo(() => {
        if (!search.trim()) return rules;

        const query = search.toLowerCase();

        return rules.filter(
            (r) =>
                r.category.toLowerCase().includes(query) ||
                r.fascia.toLowerCase().includes(query) ||
                (r.feTaskTypeName?.toLowerCase().includes(query) ?? false),
        );
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
        category: string;
        feTaskTypeId?: string | null;
        fascia: string;
        maxQuantity: number;
        maxRate: number;
    }) {
        if (editing) {
            await requisitionLimitRulesApi.update(editing.id, data);
        } else {
            await requisitionLimitRulesApi.create(data);
        }

        toast.success(
            editing
                ? "Requisition limit rule updated"
                : "Requisition limit rule created",
        );

        await load();
    }

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
                    <p className="text-sm text-danger">
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
                            ? "No requisition limit rules match your search."
                            : "No requisition limit rules yet. Create one to get started."}
                    </p>
                </Surface>
            )}

            {!loading && filtered.length > 0 && (
                <RequisitionLimitRuleTable
                    items={filtered}
                    onEdit={openEdit}
                />
            )}

        </PageContainer>
    );
}