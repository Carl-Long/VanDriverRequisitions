import { describe, expect, it } from "vitest";

import { getEditableTableRowClassName } from "@/features/requisitions-shared/lib/get-editable-table-row-class-name";
import { REQUISITION_TAB_ISSUE_SEVERITY } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";

describe("getEditableTableRowClassName", () => {
    it("adds editable row affordance when not readonly", () => {
        const result = getEditableTableRowClassName({
            readonly: false,
            issueSeverity: REQUISITION_TAB_ISSUE_SEVERITY.None,
        });

        expect(result).toContain("cursor-pointer");
        expect(result).toContain("hover:bg-surface-subtle");
    });

    it("does not add editable row affordance when readonly", () => {
        const result = getEditableTableRowClassName({
            readonly: true,
            issueSeverity: REQUISITION_TAB_ISSUE_SEVERITY.None,
        });

        expect(result).not.toContain("cursor-pointer");
        expect(result).not.toContain("hover:bg-surface-subtle");
    });

    it("adds warning background for warning severity", () => {
        const result = getEditableTableRowClassName({
            readonly: false,
            issueSeverity: REQUISITION_TAB_ISSUE_SEVERITY.Warning,
        });

        expect(result).toContain("bg-warning/10");
        expect(result).not.toContain("bg-danger/10");
    });

    it("adds danger background for blocker severity", () => {
        const result = getEditableTableRowClassName({
            readonly: false,
            issueSeverity: REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        });

        expect(result).toContain("bg-danger/10");
        expect(result).not.toContain("bg-warning/10");
    });

    it("does not add an issue background when severity is none", () => {
        const result = getEditableTableRowClassName({
            readonly: false,
            issueSeverity: REQUISITION_TAB_ISSUE_SEVERITY.None,
        });

        expect(result).not.toContain("bg-warning/10");
        expect(result).not.toContain("bg-danger/10");
    });
});