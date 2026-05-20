"use client";

import { useCallback, useEffect, useState } from "react";
import {
    submitWindowsApi,
    type SubmitWindowStatus,
} from "@/lib/api/submit-windows";

export function useSubmitWindowStatus() {
    const [status, setStatus] = useState<SubmitWindowStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await submitWindowsApi.getStatus();
            setStatus(data);
        } catch {
            // Silently fail — sidebar badge shouldn't break the app
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { status, loading, refresh };
}
