"use client";

import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api/client";

import { feTaskTypesApi, type FeTaskType } from "@/features/fe-task-types/fe-task-types-api";

export function useFeTaskTypes() {
    const [taskTypes, setTaskTypes] = useState<FeTaskType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setError(null);
                const result = await feTaskTypesApi.getAll();
                setTaskTypes(result.filter((x) => x.isActive));
            } catch (err) {
                setError(getApiErrorMessage(err, "Failed to load task types."));
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return {
        taskTypes,
        loading,
        error,
    };
}
