"use client";

import { useRouter } from "next/navigation";
import type { ZodError } from "zod";

import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";

import { mapZodErrors } from "../lib/map-zod-errors";
import { withReturnTo } from "../lib/get-safe-return-to";
import { getSubmitSubtotalError } from "../lib/get-submit-total-error";
import type { RequisitionSaveAction } from "../types/requisition-save-action";

type RequisitionDetailBase = {
    id: string;
    requisitionNumber: string;
};

type RequisitionDraftSchema = {
    safeParse: (
        value: unknown,
    ) =>
        | {
              success: true;
              data: unknown;
          }
        | {
              success: false;
              error: ZodError;
          };
};

type Options<TDraft, TSaveRequest, TDetail extends RequisitionDetailBase> = {
    draft: TDraft;
    subtotal: number;
    schema: RequisitionDraftSchema;

    requisitionId: string | null;

    backHref?: string;
    listHref: string;
    detailHref: (id: string) => string;

    create: (request: TSaveRequest) => Promise<TDetail>;
    update: (id: string, request: TSaveRequest) => Promise<TDetail>;
    submitNew: (request: TSaveRequest) => Promise<TDetail>;
    submitExisting: (id: string, request: TSaveRequest) => Promise<TDetail>;

    mapDraftToSaveRequest: (draft: TDraft) => TSaveRequest;
    mapDetailToDraft: (detail: TDetail) => TDraft;
    replaceDraft: (draft: TDraft) => void;

    setActiveAction: (action: RequisitionSaveAction) => void;
    setErrors: (errors: Record<string, string>) => void;
    clearAllErrors: () => void;
    setActiveKey: (key: string) => void;

    setIsSubmitModalOpen: (open: boolean) => void;

    saveFailureMessage: string;
    submitFailureMessage: string;
};

export function useRequisitionPersistenceActions<
    TDraft,
    TSaveRequest,
    TDetail extends RequisitionDetailBase,
>({
    draft,
    subtotal,
    schema,
    requisitionId,
    backHref,
    listHref,
    detailHref,
    create,
    update,
    submitNew,
    submitExisting,
    mapDraftToSaveRequest,
    mapDetailToDraft,
    replaceDraft,
    setActiveAction,
    setErrors,
    clearAllErrors,
    setActiveKey,
    setIsSubmitModalOpen,
    saveFailureMessage,
    submitFailureMessage,
}: Readonly<Options<TDraft, TSaveRequest, TDetail>>) {
    const router = useRouter();
    const toast = useToast();

    async function saveRequisition(
        continueEditing = false,
    ): Promise<TDetail | undefined> {
        const result = schema.safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        try {
            clearAllErrors();

            const request = mapDraftToSaveRequest(draft);

            const saved = requisitionId
                ? await update(requisitionId, request)
                : await create(request);

            replaceDraft(mapDetailToDraft(saved));

            toast.success(`Requisition #${saved.requisitionNumber} saved`);

            if (continueEditing) {
                router.push(withReturnTo(detailHref(saved.id), backHref));
            } else {
                router.push(backHref ?? listHref);
            }

            return saved;
        } catch (error) {
            setErrors({
                form: getPersistenceErrorMessage(error, saveFailureMessage),
            });
        }
    }

    async function submitRequisition() {
        const result = schema.safeParse(draft);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            setActiveKey("details");
            return;
        }

        const subtotalError = getSubmitSubtotalError(subtotal);

        if (subtotalError) {
            setErrors({
                form: subtotalError,
            });

            return;
        }

        try {
            clearAllErrors();

            const request = mapDraftToSaveRequest(draft);

            const submitted = requisitionId
                ? await submitExisting(requisitionId, request)
                : await submitNew(request);

            toast.success(`Requisition #${submitted.requisitionNumber} submitted`);
            router.push(backHref ?? listHref);
        } catch (error) {
            setErrors({
                form: getPersistenceErrorMessage(error, submitFailureMessage),
            });
        }
    }

    async function handleSaveDraft() {
        setActiveAction("saveAndClose");

        try {
            await saveRequisition();
        } finally {
            setActiveAction(null);
        }
    }

    async function handleSaveAndContinue() {
        setActiveAction("saveAndContinue");

        try {
            await saveRequisition(true);
        } finally {
            setActiveAction(null);
        }
    }

    function handleSubmitRequest() {
        setIsSubmitModalOpen(true);
    }

    async function handleSubmitConfirm() {
        setIsSubmitModalOpen(false);
        setActiveAction("submit");

        try {
            await submitRequisition();
        } finally {
            setActiveAction(null);
        }
    }

    return {
        saveRequisition,
        submitRequisition,
        handleSaveDraft,
        handleSaveAndContinue,
        handleSubmitRequest,
        handleSubmitConfirm,
    };
}

function getPersistenceErrorMessage(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) {
        return getApiErrorMessage(error, fallbackMessage);
    }

    return fallbackMessage;
}