"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/providers/auth-provider";
import {
    feRequisitionsApi,
    type FeRequisitionSummary,
    type FeRequisitionQuery,
} from "@/lib/api/fe-requisitions";
import type { PagedResult } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const REQUISITION_STATUSES = [
    "Draft",
    "Submitted",
    "Rejected",
    "Resubmitted",
    "SentToFinance",
    "Processed",
    "ReturnedFromFinance",
] as const;

const statusConfig: Record<string, { label: string; className: string }> = {
    Draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    Submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-600" },
    Rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600" },
    Resubmitted: { label: "Resubmitted", className: "bg-amber-500/10 text-amber-600" },
    SentToFinance: { label: "Sent to Finance", className: "bg-purple-500/10 text-purple-600" },
    Processed: { label: "Processed", className: "bg-emerald-500/10 text-emerald-600" },
    ReturnedFromFinance: { label: "Returned", className: "bg-orange-500/10 text-orange-600" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusPill({ status }: Readonly<{ status: string }>) {
    const config = statusConfig[status] ?? {
        label: status,
        className: "bg-muted text-muted-foreground",
    };
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(value);
}

// ─── Filter Chip ─────────────────────────────────────────────────────────────

type FilterChipProps = {
    label: string;
    onRemove: () => void;
};

function FilterChip({ label, onRemove }: Readonly<FilterChipProps>) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={`Remove filter: ${label}`}
            >
                <X size={12} />
            </button>
        </span>
    );
}

// ─── Filter State ────────────────────────────────────────────────────────────

type Filters = {
    requisitionNumber: string;
    status: string;
    createdByMe: boolean;
};

const DEFAULT_FILTERS: Filters = {
    requisitionNumber: "",
    status: "",
    createdByMe: true,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomeVanDriversPage() {
    const { user } = useAuth();
    const router = useRouter();

    // Data
    const [data, setData] = useState<PagedResult<FeRequisitionSummary> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    // Filters
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [searchInput, setSearchInput] = useState("");
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Temp filters for the modal (apply on confirm)
    const [tempFilters, setTempFilters] = useState<Filters>(DEFAULT_FILTERS);

    // ── Load data ────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const query: FeRequisitionQuery = {
                page,
                pageSize: PAGE_SIZE,
                createdByMe: filters.createdByMe,
            };
            if (filters.requisitionNumber) query.requisitionNumber = filters.requisitionNumber;
            if (filters.status) query.status = filters.status;

            const result = await feRequisitionsApi.getAll(query);
            setData(result);
        } catch {
            setError("Failed to load requisitions. Is the API running?");
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        load();
    }, [load]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // ── Search handler ───────────────────────────────────────────────────────

    // Debounced search: auto-update filter after 400ms of inactivity
    useEffect(() => {
        const trimmed = searchInput.trim();
        if (trimmed === filters.requisitionNumber) return;

        const timer = setTimeout(() => {
            setFilters((prev) => ({
                ...prev,
                requisitionNumber: trimmed,
            }));
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput, filters.requisitionNumber]);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setFilters((prev) => ({
            ...prev,
            requisitionNumber: searchInput.trim(),
        }));
    }

    // ── Filter modal ─────────────────────────────────────────────────────────

    function openFilterModal() {
        setTempFilters({ ...filters });
        setFilterModalOpen(true);
    }

    function applyFilters() {
        setFilters({ ...tempFilters });
        setFilterModalOpen(false);
    }

    function clearAllFilters() {
        const cleared: Filters = {
            requisitionNumber: "",
            status: "",
            createdByMe: false,
        };
        setFilters(cleared);
        setSearchInput("");
        setFilterModalOpen(false);
    }

    // ── Active filter chips ──────────────────────────────────────────────────

    const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

    if (filters.createdByMe) {
        activeChips.push({
            key: "mine",
            label: `My Requisitions${user ? ` (${user.name})` : ""}`,
            onRemove: () => setFilters((f) => ({ ...f, createdByMe: false })),
        });
    }

    if (filters.requisitionNumber) {
        activeChips.push({
            key: "reqNum",
            label: `Req #: ${filters.requisitionNumber}`,
            onRemove: () => {
                setFilters((f) => ({ ...f, requisitionNumber: "" }));
                setSearchInput("");
            },
        });
    }

    if (filters.status) {
        const config = statusConfig[filters.status];
        activeChips.push({
            key: "status",
            label: `Status: ${config?.label ?? filters.status}`,
            onRemove: () => setFilters((f) => ({ ...f, status: "" })),
        });
    }

    const hasFilters = activeChips.length > 0;

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <PageContainer>
            <PageHeader
                title="Home Van Drivers"
                description="View and manage FE requisitions for home van drivers."
            >
                <Button onClick={() => router.push("/home-van-drivers/new")}>
                    <Plus size={16} />
                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            {/* Search & Filter Bar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search by requisition number…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={cn(
                            "w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/30",
                            "transition-colors",
                        )}
                    />
                </form>
                <Button tone="secondary" onClick={openFilterModal}>
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                </Button>
            </div>

            {/* Active Filter Chips */}
            {hasFilters && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {activeChips.map((chip) => (
                        <FilterChip
                            key={chip.key}
                            label={chip.label}
                            onRemove={chip.onRemove}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Count */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                    {data && !loading
                        ? `${data.totalCount} requisition${data.totalCount === 1 ? "" : "s"}`
                        : "\u00A0"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="overflow-hidden rounded-xl border border-border">
                    {["a", "b", "c", "d", "e"].map((key) => (
                        <div
                            key={`skeleton-${key}`}
                            className="h-14 animate-pulse border-b border-border bg-surface last:border-b-0"
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && data && data.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-sm text-muted-foreground">
                        {hasFilters
                            ? "No requisitions match your current filters."
                            : "No requisitions yet."}
                    </p>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="mt-2 text-sm font-medium text-primary transition hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            {!loading && data && data.items.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    Req #
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    81 Code
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    Trader Name
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    Date
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-muted-foreground">
                                    Amount
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    Driver
                                </th>
                                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                                    Shop
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((req) => (
                                <tr
                                    key={req.id}
                                    onClick={() => router.push(`/home-van-drivers/${req.id}`)}
                                    className="cursor-pointer border-b border-border bg-surface transition-colors last:border-b-0 hover:bg-muted/30"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                                        {req.requisitionNumber}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                                        {req.vanDriverCode}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        {req.tradersName}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                                        {formatDate(req.requisitionDate)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                                        {formatCurrency(req.subtotal)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        <StatusPill status={req.status} />
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        {req.vanDriverName}
                                    </td>
                                    <td className="px-4 py-3 text-foreground">
                                        <span className="font-medium">{req.shopCode}</span>
                                        {" — "}
                                        <span className="text-muted-foreground">{req.shopName}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                    className="mt-6"
                />
            )}

            {/* Filter Modal */}
            <Modal
                open={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                title="Filter Requisitions"
            >
                <div className="space-y-5">
                    {/* My Requisitions Toggle */}
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={tempFilters.createdByMe}
                            onChange={(e) =>
                                setTempFilters((f) => ({
                                    ...f,
                                    createdByMe: e.target.checked,
                                }))
                            }
                            className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <span className="text-sm font-medium text-foreground">
                            Show only my requisitions
                        </span>
                    </label>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="filter-status"
                            className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                            Status
                        </label>
                        <select
                            id="filter-status"
                            value={tempFilters.status}
                            onChange={(e) =>
                                setTempFilters((f) => ({
                                    ...f,
                                    status: e.target.value,
                                }))
                            }
                            className={cn(
                                "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground",
                                "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary/30",
                                "transition-colors",
                            )}
                        >
                            <option value="">All statuses</option>
                            {REQUISITION_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {statusConfig[s]?.label ?? s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setTempFilters({
                                    requisitionNumber: "",
                                    status: "",
                                    createdByMe: false,
                                });
                            }}
                            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            Reset filters
                        </button>
                        <div className="flex items-center gap-3">
                            <Button
                                tone="secondary"
                                onClick={() => setFilterModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </PageContainer>
    );
}
