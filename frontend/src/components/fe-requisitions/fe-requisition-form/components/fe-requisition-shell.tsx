"use client";

import { is } from "zod/locales";
import { FeRequisitionDetailsTab } from "../details/fe-requisition-details-tab";
import { FeRequisitionHeader } from "../header/fe-requisition-header";
import { useFeRequisitionDraft } from "../hooks/use-fe-requisition-draft";
import { FeRequisitionTabs } from "../tabs/fe-requisition-tabs";
import { FeRequisitionPageMode } from "../types/fe-requisition-page-mode";

type Props = { mode: FeRequisitionPageMode; };

export function FeRequisitionShell({ mode, }: Readonly<Props>) {
    const {
        draft,
        subtotal,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
    } = useFeRequisitionDraft();

    const isReadonly = mode === "readonly";
    return (
        <div className="space-y-6">
            <FeRequisitionHeader
                mode={mode}
                status="Draft"
                subtotal={subtotal}
                generalTaskCount={
                    draft.generalTasks
                        .length
                }
            />

            <FeRequisitionTabs
                mode={mode}
                details={
                    <FeRequisitionDetailsTab
                        readonly={isReadonly}
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