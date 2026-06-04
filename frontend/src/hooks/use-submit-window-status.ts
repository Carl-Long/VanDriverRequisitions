"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getApiErrorMessage,
} from "@/lib/api/client";

import {
    submitWindowsApi,
    type SubmitWindowStatus,
} from "@/lib/api/submit-windows";

export function useSubmitWindowStatus() {
    const [status, setStatus] = useState<SubmitWindowStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadInitial() {
            try {
                setError(null);
                const data = await submitWindowsApi.getStatus();
                setStatus(data);
            } catch (err) {
                setError(
                    getApiErrorMessage(
                        err,
                        "Failed to load submit window status.",
                    ),
                );
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
            setError(null);
            const data = await submitWindowsApi.getStatus();

            setStatus(data);
        } catch (err) {
            setError(
                getApiErrorMessage(
                    err,
                    "Failed to refresh submit window status.",
                ),
            );
        } finally {
            const elapsed = Date.now() - started;

            if (elapsed < 400) {
                await new Promise(resolve =>
                    setTimeout(
                        resolve,
                        400 - elapsed,
                    ),
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
        error,
    };
}