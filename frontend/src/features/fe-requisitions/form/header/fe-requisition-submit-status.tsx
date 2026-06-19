"use client";

import { RequisitionSubmitStatus } from "@/features/requisitions-shared/components/requisition-submit-status";
import type { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";

type Props = {
    loading: boolean;
    status: SubmitWindowStatus | null;
};

export function FeRequisitionSubmitStatus(props: Readonly<Props>) {
    return <RequisitionSubmitStatus {...props} />;
}