import { cn } from "@/lib/utils";
import {
    REQUISITION_TAB_ISSUE_SEVERITY,
    type RequisitionTabIssueSeverity,
} from "../types/requisition-tab-issue-severity";

type Args = {
    readonly: boolean;
    issueSeverity?: RequisitionTabIssueSeverity;
};

export function getEditableTableRowClassName({
    readonly,
    issueSeverity = REQUISITION_TAB_ISSUE_SEVERITY.None,
}: Args) {
    return cn(
        issueSeverity === REQUISITION_TAB_ISSUE_SEVERITY.Warning && "bg-warning/10",
        issueSeverity === REQUISITION_TAB_ISSUE_SEVERITY.Blocker && "bg-danger/10",
        !readonly && "cursor-pointer hover:bg-surface-subtle",
    );
}