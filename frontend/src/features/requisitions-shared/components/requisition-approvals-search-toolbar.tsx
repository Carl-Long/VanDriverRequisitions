"use client";

import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/field/input";
import { fieldBase } from "@/components/ui/field/fieldstyles";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type Props = {
    requisitionNumber: string;
    onRequisitionNumberChange: (value: string) => void;
    onReset: () => void;
};

export function RequisitionApprovalsSearchToolbar({
    requisitionNumber,
    onRequisitionNumberChange,
    onReset,
}: Readonly<Props>) {
    return (
        <Surface className="mb-5 p-5">
            <div className="flex flex-col gap-5">
                <div>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} className="text-muted-foreground" />

                        <h2 className="text-sm font-semibold text-foreground">
                            Find Approvals
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Only submitted requisitions awaiting approval are shown.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full max-w-md">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            value={requisitionNumber}
                            onChange={(e) => onRequisitionNumberChange(e.target.value)}
                            placeholder="Search by requisition number..."
                            className={cn(fieldBase, "pl-9")}
                        />
                    </div>

                    <Button tone="accent" variant="solid" size="sm" onClick={onReset}>
                        <RotateCcw size={16} />

                        <span>Clear Search</span>
                    </Button>
                </div>
            </div>
        </Surface>
    );
}