"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import {
    requisitionLimitRulesApi,
    RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";
import { useEffect, useState } from "react";

export default function NewRequisitionPage() {

    const [limitRules, setLimitRules] =
        useState<
            RequisitionLimitRuleSummary[]
        >([]);

    useEffect(() => {
        async function load() {
            const rules =
                await requisitionLimitRulesApi.getAll();

            setLimitRules(rules);
        }

        load();
    }, []);

    return (
        <PageContainer>
            <PageHeader
                title="New Requisition"
                description="Create a new FE requisition."
            />
            <FeRequisitionShell
                mode="create"
                limitRules={limitRules}
            />
        </PageContainer>
    );
}
