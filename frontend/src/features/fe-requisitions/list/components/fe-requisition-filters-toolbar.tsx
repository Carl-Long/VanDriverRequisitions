"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import { fieldBase } from "@/components/ui/field/fieldstyles";
import { Input } from "@/components/ui/field/input";
import { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";
import { CreatedByUserFilterField } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";
import { StatusFilterField } from "@/features/fe-requisitions/list/filter-fields/status-filter-field";


type Props = {
    filters: FeRequisitionFilters;

    onFiltersChange: (filters: FeRequisitionFilters) => void;

    onReset: () => void;
};

export function FeRequisitionFiltersToolbar({
    filters,
    onFiltersChange,
    onReset,
}: Readonly<Props>) {
    return (
        <Surface className="mb-5 p-5">
            <div className="flex flex-col gap-5">
                {/* Header */}

                <div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-[1em] text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-foreground">Find Requisitions</h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Showing your requisitions by default. Refine by creator, status, or shop.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-md">
                        <Search
                            className="size-[0.95em] absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

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

                    <Button tone="accent" variant="solid" size="sm" onClick={onReset}>
                        <RotateCcw className="size-[1em]" />

                        <span>Reset Filters</span>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                    <div className="min-w-[260px] flex-1">
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
                    </div>

                    <div className="min-w-[220px]">
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
                    </div>

                    <div className="min-w-[260px] flex-1">
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
            </div>
        </Surface>
    );
}
