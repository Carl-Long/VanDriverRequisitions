"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";

import type { RequisitionPageMode } from "../types/requisition-page-mode";
import type { RequisitionSaveAction } from "../types/requisition-save-action";
import type {
    ApproveRequisitionRequest,
    RejectRequisitionRequest,
    RequisitionApprovalResult,
} from "../types/requisition-approval.types";

type Options = {
    mode: RequisitionPageMode;
    requisitionId: string | null;
    rowVersion: string | null;
    backHref?: string;
    fallbackApprovalsHref: string;
    approve: (
        requisitionId: string,
        request: ApproveRequisitionRequest,
    ) => Promise<RequisitionApprovalResult>;
    reject: (
        requisitionId: string,
        request: RejectRequisitionRequest,
    ) => Promise<RequisitionApprovalResult>;
    clearAllErrors: () => void;
    setFormError: (message: string) => void;
};

export function useRequisitionApprovalActions({
    mode,
    requisitionId,
    rowVersion,
    backHref,
    fallbackApprovalsHref,
    approve,
    reject,
    clearAllErrors,
    setFormError,
}: Readonly<Options>) {
    const router = useRouter();
    const toast = useToast();

    const [activeAction, setActiveAction] =
        useState<RequisitionSaveAction>(null);

    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    function openApproveModal() {
        if (mode !== "approval") {
            return;
        }

        setIsApproveModalOpen(true);
    }

    function openRejectModal() {
        if (mode !== "approval") {
            return;
        }

        setIsRejectModalOpen(true);
    }

    function closeApproveModal() {
        setIsApproveModalOpen(false);
    }

    function closeRejectModal() {
        setIsRejectModalOpen(false);
    }

    async function confirmApprove() {
        if (!requisitionId) {
            return;
        }

        setIsApproveModalOpen(false);
        setActiveAction("approve");

        try {
            clearAllErrors();

            const approved = await approve(requisitionId, {
                rowVersion,
            });

            toast.success(`Requisition #${approved.requisitionNumber} approved`);
            router.push(backHref ?? fallbackApprovalsHref);
        } catch (err) {
            setFormError(
                getApprovalErrorMessage(err, "Failed to approve requisition"),
            );
        } finally {
            setActiveAction(null);
        }
    }

    async function confirmReject(rejectionNotes: string) {
        if (!requisitionId) {
            return;
        }

        setIsRejectModalOpen(false);
        setActiveAction("reject");

        try {
            clearAllErrors();

            const rejected = await reject(requisitionId, {
                rowVersion,
                rejectionNotes,
            });

            toast.success(`Requisition #${rejected.requisitionNumber} rejected`);
            router.push(backHref ?? fallbackApprovalsHref);
        } catch (err) {
            setFormError(
                getApprovalErrorMessage(err, "Failed to reject requisition"),
            );
        } finally {
            setActiveAction(null);
        }
    }

    return {
        activeAction,
        isApproveModalOpen,
        isRejectModalOpen,
        openApproveModal,
        openRejectModal,
        closeApproveModal,
        closeRejectModal,
        confirmApprove,
        confirmReject,
    };
}

function getApprovalErrorMessage(err: unknown, fallbackMessage: string) {
    if (err instanceof ApiError) {
        return getApiErrorMessage(err, fallbackMessage);
    }

    return fallbackMessage;
}