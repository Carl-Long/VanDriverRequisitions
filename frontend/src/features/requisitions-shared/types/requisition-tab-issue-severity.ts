export const REQUISITION_TAB_ISSUE_SEVERITY = {
    None: "none",
    Warning: "warning",
    Blocker: "blocker",
} as const;

export type RequisitionTabIssueSeverity =
    typeof REQUISITION_TAB_ISSUE_SEVERITY[keyof typeof REQUISITION_TAB_ISSUE_SEVERITY];

type LimitStatusLike = {
    state: "ok" | "missing-limit" | "exceeds-limit";
};

const severityRank: Record<RequisitionTabIssueSeverity, number> = {
    none: 0,
    warning: 1,
    blocker: 2,
};

export function combineRequisitionTabIssueSeverities(
    ...severities: RequisitionTabIssueSeverity[]
): RequisitionTabIssueSeverity {
    return severities.reduce<RequisitionTabIssueSeverity>((current, next) => {
        return severityRank[next] > severityRank[current] ? next : current;
    }, REQUISITION_TAB_ISSUE_SEVERITY.None);
}

export function getHistoricalLookupTabIssueSeverity(
    hasHistoricalLookupIssue: boolean,
): RequisitionTabIssueSeverity {
    return hasHistoricalLookupIssue
        ? REQUISITION_TAB_ISSUE_SEVERITY.Warning
        : REQUISITION_TAB_ISSUE_SEVERITY.None;
}

export function getLimitStatusTabIssueSeverity(
    status: LimitStatusLike,
): RequisitionTabIssueSeverity {
    return status.state === "ok"
        ? REQUISITION_TAB_ISSUE_SEVERITY.None
        : REQUISITION_TAB_ISSUE_SEVERITY.Blocker;
}

export function isBlockingRequisitionTabIssue(
    severity: RequisitionTabIssueSeverity,
): boolean {
    return severity === REQUISITION_TAB_ISSUE_SEVERITY.Blocker;
}

export function hasBlockingRequisitionTabIssue(
    severities: RequisitionTabIssueSeverity[],
): boolean {
    return severities.some(isBlockingRequisitionTabIssue);
}

export function getRequisitionRowIssueSeverity({
    hasWarning,
    hasBlocker,
}: {
    hasWarning?: boolean;
    hasBlocker?: boolean;
}): RequisitionTabIssueSeverity {
    if (hasBlocker) {
        return REQUISITION_TAB_ISSUE_SEVERITY.Blocker;
    }

    if (hasWarning) {
        return REQUISITION_TAB_ISSUE_SEVERITY.Warning;
    }

    return REQUISITION_TAB_ISSUE_SEVERITY.None;
}