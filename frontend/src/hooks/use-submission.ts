"use client";

import { useEffect, useState } from "react";
import { feRequisitionsApi, FeRequisitionSubmissionDetail } from "@/lib/api/fe-requisitions";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";

type UseSubmissionResult = {
    data: FeRequisitionSubmissionDetail | null;
    loading: boolean;
    error: string | null;
    notFound: boolean;
};

export function useSubmission(submissionId: string): UseSubmissionResult {
    const [data, setData] = useState<FeRequisitionSubmissionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setError(null);
                setNotFound(false);
                setLoading(true);

                const result = await feRequisitionsApi.getSubmission(submissionId);

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (cancelled) return;

                if (err instanceof ApiError && err.status === 404) {
                    setNotFound(true);
                    return;
                }

                setError(
                    getApiErrorMessage(
                        err,
                        "Failed to load submission."
                    )
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [submissionId]);

    return { data, loading, error, notFound };
}