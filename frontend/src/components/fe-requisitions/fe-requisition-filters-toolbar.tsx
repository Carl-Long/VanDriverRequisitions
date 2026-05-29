"use client";

import {
    RotateCcw,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { Surface } from "@/components/ui/surface";

import { cn } from "@/lib/utils";

import type { FeRequisitionFilters } from "./types";

import { CreatedByUserFilterField } from "./filter-fields/created-by-user-filter-field";
import { StatusFilterField } from "./filter-fields/status-filter-field";
import { ShopFilterField } from "./filter-fields/shop-filter-field";
import { fieldBase } from "../ui/field/fieldstyles";

type Props = {
    filters: FeRequisitionFilters;

    onFiltersChange: (
        filters: FeRequisitionFilters,
    ) => void;

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
                        <SlidersHorizontal
                            size={16}
                            className="text-muted-foreground"
                        />

                        <h2 className="text-sm font-semibold text-foreground">
                            Find Requisitions
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                     Showing your requisitions by default. Refine by creator, status, or shop.
                    </p>
                </div>

                {/* Search row */}

                <div className="flex flex-wrap items-center gap-3">

                    <div className="relative min-w-[320px] flex-1">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            value={
                                filters.requisitionNumber
                            }
                            onChange={(e) => {
                                onFiltersChange({
                                    ...filters,

                                    requisitionNumber:
                                        e.target.value,
                                });
                            }}
                            placeholder="Search by requisition number..."
                            className={cn(
                                fieldBase,
                                "pl-9",
                            )}
                        />
                    </div>

                    <Button
                        tone="secondary"
                        variant="ghost"
                        onClick={onReset}
                    >
                        <RotateCcw size={16} />

                        <span>
                            Reset Filters
                        </span>
                    </Button>
                </div>

                {/* Filter row */}

                <div className="flex flex-wrap items-center gap-3">

                    {/* Created By */}

                    <div className="min-w-[260px] flex-1">
                        <CreatedByUserFilterField
                            hideLabel
                            value={
                                filters.createdBy
                            }
                            onChange={(value) => {
                                onFiltersChange({
                                    ...filters,

                                    createdBy:
                                        value,
                                });
                            }}
                        />
                    </div>

                    {/* Status */}

                    <div className="min-w-[220px]">
                        <StatusFilterField
                            hideLabel
                            value={filters.status}
                            onChange={(value) => {
                                onFiltersChange({
                                    ...filters,

                                    status:
                                        value,
                                });
                            }}
                        />
                    </div>

                    {/* Shop */}

                    <div className="min-w-[260px] flex-1">
                        <ShopFilterField
                            hideLabel
                            value={filters.shopId}
                            label={
                                filters.shopLabel
                            }
                            includeAllOption={true}
                            prefixLabel={true}
                            onChange={(
                                value,
                                label,
                            ) => {
                                onFiltersChange({
                                    ...filters,

                                    shopId:
                                        value,

                                    shopLabel:
                                        label,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </Surface>
    );
}