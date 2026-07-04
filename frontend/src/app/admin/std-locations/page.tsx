"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPinned, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination/pagination";
import { Surface } from "@/components/ui/surface";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { Toggle } from "@/components/ui/toggle";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";
import { StdCollectionTypeField } from "@/features/std-collection-types/std-collection-type-field";
import { StdLocationFormModal } from "@/features/std-locations/std-location-form-modal";
import { StdLocationTable } from "@/features/std-locations/std-location-table";
import { stdLocationsApi, } from "@/features/std-locations/std-locations-api";
import { useCrudModal } from "@/hooks/use-crud-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { useToast } from "@/providers/toast-provider";
import { StdLocation, CreateStdLocation } from "@/features/std-locations/std-location.types";
import { fieldBase } from "@/components/ui/field/fieldstyles";
import { Input } from "@/components/ui/field/input";
import { cn } from "@/lib/utils";
import { useOptimisticPaginatedActiveToggle } from "@/features/admin-shared/use-optimistic-paginated-active-toggle";

const PAGE_SIZE = 10;

export default function StdLocationsPage() {
    const [data, setData] = useState<PagedResult<StdLocation> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [shopId, setShopId] = useState<string | null>(null);
    const [shopLabel, setShopLabel] = useState<string | null>(null);
    const [collectionTypeId, setCollectionTypeId] = useState<string | null>(null);
    const [collectionTypeLabel, setCollectionTypeLabel] = useState<string | null>(null);
    const [includeInactive, setIncludeInactive] = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const modal = useCrudModal<StdLocation>();
    const toast = useToast();

    const { pendingIds, toggleActive } = useOptimisticPaginatedActiveToggle({
        setData,
        showInactive: includeInactive,
        activate: stdLocationsApi.activate,
        deactivate: stdLocationsApi.deactivate,
        afterSuccess: stdLocationsApi.clearCache,
        onBeforeToggle: () => setError(null),
        onSuccess: (location, nextIsActive) => {
            toast.success(
                nextIsActive
                    ? `${location.locationName} activated`
                    : `${location.locationName} deactivated`,
            );
        },
        onError: (err) => {
            setError(getApiErrorMessage(err, "Failed to update STD location."));
        },
    });

    const fetchLocations = useCallback(
        () =>
            stdLocationsApi.getAll({
                page,
                pageSize: PAGE_SIZE,
                search: debouncedSearch,
                shopId,
                collectionTypeId,
                includeInactive,
            }),
        [page, debouncedSearch, shopId, collectionTypeId, includeInactive],
    );

    async function reloadLocations() {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchLocations();
            setData(result);
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to load STD locations."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        fetchLocations()
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, "Failed to load STD locations."));
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
    }, [fetchLocations]);

    function resetPageForFilterChange() {
        setPage(1);
        setLoading(true);
        setError(null);
    }

    function handleSearchChange(value: string) {
        resetPageForFilterChange();
        setSearch(value);
    }

    function handleShopChange(value: string | null, label: string | null) {
        resetPageForFilterChange();
        setShopId(value);
        setShopLabel(label);
    }

    function handleCollectionTypeChange(value: string | null, label: string | null) {
        resetPageForFilterChange();
        setCollectionTypeId(value);
        setCollectionTypeLabel(label);
    }

    function handleIncludeInactiveChange() {
        resetPageForFilterChange();
        setIncludeInactive((value) => !value);
    }

    function handlePageChange(nextPage: number) {
        setLoading(true);
        setError(null);
        setPage(nextPage);
    }

    async function handleSubmit(form: CreateStdLocation) {
        if (modal.editing) {
            await stdLocationsApi.update(modal.editing.id, form);
        } else {
            await stdLocationsApi.create(form);
        }

        stdLocationsApi.clearCache();

        toast.success(
            modal.editing
                ? `STD location "${form.locationName}" updated`
                : `STD location "${form.locationName}" created`,
        );

        modal.close();
        await reloadLocations();
    }

    function handleResetFilters() {
        setLoading(true);
        setError(null);
        setSearch("");
        setShopId(null);
        setShopLabel(null);
        setCollectionTypeId(null);
        setCollectionTypeLabel(null);
        setIncludeInactive(false);
        setPage(1);
    }

    return (
        <PageContainer>
            <PageHeader
                title="STD Locations"
                description="Manage STD collection locations by shop and collection type."
            >
                <Button onClick={modal.openCreate}>
                    <Plus className="size-[1em]" />
                    New Location
                </Button>
            </PageHeader>
            <Surface className="mb-5 p-5">
                <div className="flex flex-col gap-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="size-[1em] text-muted-foreground" />
                            <h2 className="text-sm font-semibold text-foreground">
                                Find Locations
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Search by location name or postcode, then refine by shop, collection type, or active state.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full max-w-md">
                            <Search
                                className="size-[0.95em] absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <Input
                                value={search}
                                onChange={(event) => {
                                    handleSearchChange(event.target.value);
                                }}
                                placeholder="Search location or postcode..."
                                className={cn(fieldBase, "pl-9")}
                            />
                        </div>

                        <Button
                            tone="accent"
                            variant="solid"
                            size="sm"
                            onClick={handleResetFilters}
                        >
                            <RotateCcw className="size-[1em]" />

                            <span>Reset Filters</span>
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="min-w-[260px] flex-1">
                            <ShopFilterField
                                hideLabel
                                includeAllOption
                                prefixLabel
                                value={shopId}
                                label={shopLabel}
                                placeholder="Filter by shop"
                                onChange={handleShopChange}
                            />
                        </div>

                        <div className="min-w-[260px] flex-1">
                            <StdCollectionTypeField
                                hideLabel
                                includeAllOption
                                prefixLabel
                                value={collectionTypeId}
                                label={collectionTypeLabel}
                                onChange={handleCollectionTypeChange}
                            />
                        </div>

                        <div className="flex h-10 min-w-[220px] items-center justify-between gap-3 rounded-lg border border-border bg-surface-elevated px-3">
                            <span className="text-sm text-muted-foreground">
                                Include inactive
                            </span>

                            <Toggle
                                checked={includeInactive}
                                onChange={handleIncludeInactiveChange}
                                ariaLabel="Toggle inactive STD locations"
                            />
                        </div>
                    </div>

                    {data && (
                        <div className="text-sm text-muted-foreground">
                            Showing page {data.page} of {data.totalPages || 1} ·{" "}
                            {data.totalCount.toLocaleString()} locations
                        </div>
                    )}
                </div>
            </Surface>

            {error && <Alert>{error}</Alert>}

            {loading && <TableSkeleton rows={8} columns={7} />}

            {!loading && data?.items.length === 0 && (
                <EmptyState
                    icon={MapPinned}
                    title="No STD locations found"
                    description="Try adjusting the shop, collection type, inactive toggle, or search term."
                />
            )}

            {!loading && data && data.items.length > 0 && (
                <StdLocationTable
                    items={data.items}
                    pendingIds={pendingIds}
                    onEdit={modal.openEdit}
                    onToggleActive={toggleActive}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                    className="mt-6"
                />
            )}

            <StdLocationFormModal
                key={modal.editing?.id ?? "new"}
                open={modal.open}
                onClose={modal.close}
                onSubmit={handleSubmit}
                initial={modal.editing}
            />
        </PageContainer>
    );
}