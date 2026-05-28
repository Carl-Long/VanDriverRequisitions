"use client";

import { FeRequisitionDetailsTab } from "../details/fe-requisition-details-tab";
import { FeRequisitionHeader } from "../header/fe-requisition-header";
import { useFeRequisitionDraft } from "../hooks/use-fe-requisition-draft";
import { FeRequisitionTabs } from "../tabs/fe-requisition-tabs";

export function FeRequisitionShell() {
    const {
        draft,

        subtotal,

        setRequisitionDate,

        setVanDriver,

        setVanDriverName,

        setShop,
    } = useFeRequisitionDraft();

    return (
        <div className="space-y-6">
            <FeRequisitionHeader
                subtotal={subtotal}
                generalTaskCount={
                    draft.generalTasks
                        .length
                }
            />

            <FeRequisitionTabs
                details={
                    <FeRequisitionDetailsTab
                        draft={draft}
                        subtotal={
                            subtotal
                        }
                        onRequisitionDateChange={
                            setRequisitionDate
                        }
                        onVanDriverChange={
                            setVanDriver
                        }
                        onVanDriverNameChange={
                            setVanDriverName
                        }
                        onShopChange={
                            setShop
                        }
                    />
                }
                generalTasks={
                    <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                        <div className="text-sm text-muted-foreground">
                            No general
                            tasks added
                            yet
                        </div>
                    </div>
                }
            />
        </div>
    );
}