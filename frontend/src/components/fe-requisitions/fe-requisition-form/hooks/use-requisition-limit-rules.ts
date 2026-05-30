"use client";

import { useEffect, useState } from "react";
import { requisitionLimitRulesApi, RequisitionLimitRuleSummary, } from "@/lib/api/requisition-limit-rules";

export function useRequisitionLimitRules() {
    const [limitRules, setLimitRules] = useState<RequisitionLimitRuleSummary[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const rules =
                    await requisitionLimitRulesApi.getAll();

                setLimitRules(rules);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return {
        limitRules,
        loading,
    };
}