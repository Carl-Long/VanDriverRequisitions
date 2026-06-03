"use client";

import { useEffect, useState } from "react";

import { getApiErrorMessage, } from "@/lib/api/client";

import {
    requisitionLimitRulesApi,
    type RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";

export function useRequisitionLimitRules() {
    const [limitRules, setLimitRules] = useState<RequisitionLimitRuleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setError(null);
                const rules = await requisitionLimitRulesApi.getAll();
                setLimitRules(rules);
            } catch (err) {
                setError(
                    getApiErrorMessage(
                        err,
                        "Failed to load requisition limit rules.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return {
        limitRules,
        loading,
        error,
    };
}