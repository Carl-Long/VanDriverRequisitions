"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/navigation-back-link";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { StdRequisitionDetail } from "../../types/std-requisition.types";
import type { StdRequisitionPageMode } from "../types/std-requisition-page-mode";
import { useStdRequisitionDraft } from "../hooks/use-std-requisition-draft";
import { StdRequisitionDetailsTab } from "../details/std-requisition-details-tab";
import { StdRequisitionTabs } from "../tabs/std-requisition-tabs";
import { StdCollectionChargeBanksAndBinsWorkspace } from "../collection-charges-banks-and-bins/std-collection-charge-banks-and-bins-workspace";

import { mapStdRequisitionDetailToDraft } from "../lib/map-std-requisition-detail-to-draft";
import { mapZodErrors } from "@/features/fe-requisitions/form/lib/map-zod-errors";
import { getApiErrorMessage } from "@/lib/api/client";
import { stdRequisitionsApi } from "../../api/std-requisitions-api";
import { mapStdRequisitionDraftToSaveRequest } from "../lib/map-std-requisition-draft-to-save-request";
import { createStdRequisitionSchema } from "../schemas/std-requisition-schema";
import { Button } from "@/components/ui/button/button";
import { useRouter } from "next/navigation";



type Props = {
    mode: StdRequisitionPageMode;
    stdRequisition?: StdRequisitionDetail;
    initialActiveTabKey?: string;
    backHref?: string;
};

export type StdSaveAction =
    | "saveAndContinue"
    | "saveAndClose"
    | "submit"
    | "approve"
    | "reject"
    | null;

export function StdRequisitionShell({
    mode,
    stdRequisition,
    initialActiveTabKey,
    backHref,
}: Readonly<Props>) {

    const router = useRouter();
    const initialDraft = useMemo(() => (stdRequisition ? mapStdRequisitionDetailToDraft(stdRequisition) : undefined), [stdRequisition]);

    const {
        draft,
        subtotal,
        replaceDraft,
        setRequisitionDate,
        setVanDriver,
        setVanDriverName,
        setShop,
        addCollectionChargeBanksAndBins,
        updateCollectionChargeBanksAndBins,
        removeCollectionChargeBanksAndBins,
    } = useStdRequisitionDraft(initialDraft);

    const [activeKey, setActiveKey] = useState(initialActiveTabKey ?? "details");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [savingAction, setSavingAction] = useState<StdSaveAction>(null);

    const isReadonly = mode === "readonly" || mode === "approval";

    function clearError(field: string) {
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    async function handleSave(action: Exclude<StdSaveAction, "submit" | "approve" | "reject" | null>) {
        const validation = createStdRequisitionSchema().safeParse(draft);

        if (!validation.success) {
            const nextErrors = mapZodErrors(validation.error);
            setErrors(nextErrors);

            if (
                nextErrors.requisitionDate ||
                nextErrors.vanDriverId ||
                nextErrors.vanDriverName ||
                nextErrors.shopId
            ) {
                setActiveKey("details");
            } else {
                setActiveKey("collection-charges-banks-and-bins");
            }

            return;
        }

        setSavingAction(action);
        setErrors({});

        try {
            const request = mapStdRequisitionDraftToSaveRequest(draft);

            const saved = draft.requisitionId
                ? await stdRequisitionsApi.update(draft.requisitionId, request)
                : await stdRequisitionsApi.create(request);

            replaceDraft(mapStdRequisitionDetailToDraft(saved));

            if (action === "saveAndClose") {
                router.push(backHref ?? "/standard-van-drivers");
                return;
            }

            if (!draft.requisitionId) {
                const editHref = `/standard-van-drivers/${saved.id}${backHref ? `?returnTo=${encodeURIComponent(backHref)}` : ""
                    }`;

                router.replace(editHref);
            }
        } catch (err) {
            setErrors({
                form: getApiErrorMessage(err, "Failed to save STD requisition."),
            });
        } finally {
            setSavingAction(null);
        }
    }

    const title =
        mode === "create"
            ? "Create New STD Requisition"
            : mode === "edit"
                ? "Editing STD Requisition"
                : mode === "approval"
                    ? "Reviewing STD Requisition"
                    : "Viewing STD Requisition";

    return (
        <div className="space-y-4">
            <div className="pb-2">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {backHref && (
                            <>
                                <BackLink href={backHref} compact>
                                    Requisitions
                                </BackLink>

                                <div className="hidden h-4 w-px bg-border sm:block" />
                            </>
                        )}

                        <h1 className="flex flex-wrap items-center gap-3 text-lg font-semibold leading-none tracking-tight">
                            <span>{title}</span>

                            {mode !== "create" && draft.requisitionNumber && (
                                <span className="font-mono">{draft.requisitionNumber}</span>
                            )}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-surface px-3 py-1 text-xs font-medium text-warning">
                            {draft.status ?? "Unsaved"}
                        </span>

                        <div className="h-4 w-px bg-border" />

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Subtotal</span>

                            <span className="font-medium tabular-nums">
                                {formatCurrencyGB(subtotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {!isReadonly && (
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={savingAction !== null}
                        onClick={() => handleSave("saveAndClose")}
                    >
                        {savingAction === "saveAndClose" ? "Saving..." : "Save & Close"}
                    </Button>

                    <Button
                        type="button"
                        disabled={savingAction !== null}
                        onClick={() => handleSave("saveAndContinue")}
                    >
                        {savingAction === "saveAndContinue" ? "Saving..." : "Save & Continue"}
                    </Button>
                </div>
            )}

            {errors.form && <Alert tone="danger">{errors.form}</Alert>}

            <StdRequisitionTabs
                activeKey={activeKey}
                onActiveKeyChange={setActiveKey}
                submissionHistoryCount={draft.submissionHistory.length}
                details={
                    <StdRequisitionDetailsTab
                        readonly={isReadonly}
                        draft={draft}
                        errors={errors}
                        clearError={clearError}
                        onRequisitionDateChange={setRequisitionDate}
                        onVanDriverChange={setVanDriver}
                        onVanDriverNameChange={setVanDriverName}
                        onShopChange={setShop}
                    />
                }
                collectionChargesBanksAndBins={
                    <StdCollectionChargeBanksAndBinsWorkspace
                        readonly={isReadonly}
                        shopId={draft.shopId}
                        rows={draft.collectionChargesBanksAndBins}
                        onAdd={addCollectionChargeBanksAndBins}
                        onUpdate={updateCollectionChargeBanksAndBins}
                        onDelete={removeCollectionChargeBanksAndBins}
                    />
                }
                submissionHistory={
                    <Alert>
                        Submission history will be wired after save, submit, and submission view are
                        connected.
                    </Alert>
                }
            />
        </div>
    );
}