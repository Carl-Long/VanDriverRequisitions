"use client";

import { useCallback, useState } from "react";

import type { RequisitionSaveAction } from "../types/requisition-save-action";

type Options = {
    initialActiveTabKey?: string;
    defaultActiveTabKey?: string;
};

export function useRequisitionShellUiState({
    initialActiveTabKey,
    defaultActiveTabKey = "details",
}: Readonly<Options>) {
    const [activeAction, setActiveAction] = useState<RequisitionSaveAction>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeKey, setActiveKey] = useState(initialActiveTabKey ?? defaultActiveTabKey);

    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const clearError = useCallback((field: string) => {
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        activeAction,
        setActiveAction,

        errors,
        setErrors,
        clearError,
        clearAllErrors,

        activeKey,
        setActiveKey,

        isSubmitModalOpen,
        setIsSubmitModalOpen,

        isApproveModalOpen,
        setIsApproveModalOpen,

        isRejectModalOpen,
        setIsRejectModalOpen,

        isSaving,
        setIsSaving,
    };
}