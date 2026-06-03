"use client";

import { useCallback, useEffect, useState } from "react";

import {
    submitWindowsApi,
    type SubmitWindowStatus,
} from "@/lib/api/submit-windows";

export function useSubmitWindowStatus() {
    const [status, setStatus] = useState<SubmitWindowStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        async function loadInitial() {
            try {
                const data = await submitWindowsApi.getStatus();
                setStatus(data);
            } catch {
                // silent fail
            } finally {
                setLoading(false);
            }
        }
        loadInitial();
    }, []);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const started = Date.now();
        try {
            const data = await submitWindowsApi.getStatus();
            setStatus(data);
        } finally {
            const elapsed = Date.now() - started;

            if (elapsed < 400) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 400 - elapsed)
                );
            }
            setRefreshing(false);
        }
    }, []);

    return {
        status,
        loading,
        refreshing,
        refresh,
    };
}