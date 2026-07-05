import { describe, expect, it } from "vitest";

import {
    combineRequisitionTabIssueSeverities,
    getHistoricalLookupTabIssueSeverity,
    getLimitStatusTabIssueSeverity,
    getRequisitionRowIssueSeverity,
    hasBlockingRequisitionTabIssue,
    isBlockingRequisitionTabIssue,
    REQUISITION_TAB_ISSUE_SEVERITY,
} from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

describe("requisition tab issue severity helpers", () => {
    it("combines severities by returning the most severe value", () => {
        expect(
            combineRequisitionTabIssueSeverities(
                REQUISITION_TAB_ISSUE_SEVERITY.None,
                REQUISITION_TAB_ISSUE_SEVERITY.Warning,
            ),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Warning);

        expect(
            combineRequisitionTabIssueSeverities(
                REQUISITION_TAB_ISSUE_SEVERITY.Warning,
                REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
            ),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);

        expect(
            combineRequisitionTabIssueSeverities(
                REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
                REQUISITION_TAB_ISSUE_SEVERITY.Warning,
                REQUISITION_TAB_ISSUE_SEVERITY.None,
            ),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("maps historical lookup issues to warning severity", () => {
        expect(getHistoricalLookupTabIssueSeverity(false)).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.None,
        );

        expect(getHistoricalLookupTabIssueSeverity(true)).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Warning,
        );
    });

    it("maps missing and exceeded limits to blocker severity", () => {
        expect(
            getLimitStatusTabIssueSeverity({
                state: "ok",
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);

        expect(
            getLimitStatusTabIssueSeverity({
                state: "missing-limit",
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);

        expect(
            getLimitStatusTabIssueSeverity({
                state: "exceeds-limit",
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("identifies blocking severities", () => {
        expect(
            isBlockingRequisitionTabIssue(
                REQUISITION_TAB_ISSUE_SEVERITY.None,
            ),
        ).toBe(false);

        expect(
            isBlockingRequisitionTabIssue(
                REQUISITION_TAB_ISSUE_SEVERITY.Warning,
            ),
        ).toBe(false);

        expect(
            isBlockingRequisitionTabIssue(
                REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
            ),
        ).toBe(true);
    });

    it("returns true when any tab issue is blocking", () => {
        expect(
            hasBlockingRequisitionTabIssue([
                REQUISITION_TAB_ISSUE_SEVERITY.None,
                REQUISITION_TAB_ISSUE_SEVERITY.Warning,
            ]),
        ).toBe(false);

        expect(
            hasBlockingRequisitionTabIssue([
                REQUISITION_TAB_ISSUE_SEVERITY.Warning,
                REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
            ]),
        ).toBe(true);
    });

    it("maps row warning and blocker state to the correct severity", () => {
        expect(
            getRequisitionRowIssueSeverity({
                hasWarning: false,
                hasBlocker: false,
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);

        expect(
            getRequisitionRowIssueSeverity({
                hasWarning: true,
                hasBlocker: false,
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Warning);

        expect(
            getRequisitionRowIssueSeverity({
                hasWarning: false,
                hasBlocker: true,
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);

        expect(
            getRequisitionRowIssueSeverity({
                hasWarning: true,
                hasBlocker: true,
            }),
        ).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });
});