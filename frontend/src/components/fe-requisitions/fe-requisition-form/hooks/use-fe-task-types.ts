"use client";

import { FeTaskType, feTaskTypesApi } from "@/lib/api/fe-task-types";
import { useEffect, useState } from "react";

export function useFeTaskTypes() {
    const [taskTypes, setTaskTypes] =
        useState<FeTaskType[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        async function load() {
            try {
                const result =
                    await feTaskTypesApi.getAll();

                setTaskTypes(
                    result.filter(
                        (x) => x.isActive,
                    ),
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return {
        taskTypes,
        loading,
    };
}