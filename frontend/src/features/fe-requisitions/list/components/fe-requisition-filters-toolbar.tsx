"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { fieldBase } from "@/components/ui/field/fieldstyles";
import { Input } from "@/components/ui/field/input";
import { PageSizeSelect } from "@/components/ui/page-size-select";
import { Surface } from "@/components/ui/surface";
import { CreatedByUserFilterField } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";
import { cn } from "@/lib/utils";

import { PAGE_SIZE_OPTIONS } from "../../constants/fe-requisition-status.constants";
import { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";
import { StatusFilterField } from "../filter-fields/status-filter-field";

type Props = {
    filters: FeRequisitionFilters;
    pageSize: number;
    onFiltersChange: (filters: FeRequisitionFilters) => void;
    onPageSizeChange: (pageSize: number) => void;
    onReset: () => void;
};

export function FeRequisitionFiltersToolbar({
    filters,
    pageSize,
    onFiltersChange,
    onPageSizeChange,
    onReset,
}: Readonly<Props>) {
    return (
        <Surface className="mb-5 p-5">
            <div className="flex flex-col gap-5">
                <div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-[1em] text-muted-foreground" />

                        <h2 className="text-sm font-semibold text-foreground">
                            Find Requisitions
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Showing your requisitions by default. Refine by creator, status, or shop.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(260px,420px)_auto_minmax(0,1fr)_180px] md:items-center">
                    <div className="relative min-w-0">
                        <Search className="size-[0.95em] absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={filters.requisitionNumber}
                            onChange={(e) => {
                                onFiltersChange({
                                    ...filters,
                                    requisitionNumber: e.target.value,
                                });
                            }}
                            placeholder="Search by requisition number..."
                            className={cn(fieldBase, "pl-9")}
                        />
                    </div>

                    <Button tone="accent" variant="solid" onClick={onReset}>
                        <RotateCcw className="size-[1em]" />
                        <span>Reset Filters</span>
                    </Button>

                    <div className="hidden md:block" />

                    <PageSizeSelect
                        pageSize={pageSize}
                        options={PAGE_SIZE_OPTIONS}
                        onPageSizeChange={onPageSizeChange}
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_minmax(260px,1fr)]">
                    <CreatedByUserFilterField
                        hideLabel
                        fascia="Fe"
                        value={filters.createdBy}
                        onChange={(value) => {
                            onFiltersChange({
                                ...filters,
                                createdBy: value,
                            });
                        }}
                    />

                    <StatusFilterField
                        hideLabel
                        value={filters.status}
                        onChange={(value) => {
                            onFiltersChange({
                                ...filters,
                                status: value,
                            });
                        }}
                    />

                    <ShopFilterField
                        hideLabel
                        value={filters.shopId}
                        label={filters.shopLabel}
                        includeAllOption={true}
                        prefixLabel={true}
                        onChange={(value, label) => {
                            onFiltersChange({
                                ...filters,
                                shopId: value,
                                shopLabel: label,
                            });
                        }}
                    />
                </div>
            </div>
        </Surface>
    );
}