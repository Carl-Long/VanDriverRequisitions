import { cn } from "@/lib/utils";

type Args = {
    readonly: boolean;
    hasIssue?: boolean;
};

export function getEditableTableRowClassName({ readonly, hasIssue }: Args) {
    return cn(
        hasIssue && "bg-warning/10",
        !readonly && "cursor-pointer hover:bg-surface-subtle",
    );
}