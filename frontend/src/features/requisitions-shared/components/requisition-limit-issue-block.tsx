import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export type RequisitionLimitIssueState =
    | "ok"
    | "missing-limit"
    | "exceeds-limit";

export type RequisitionLimitIssueStatus = {
    state: RequisitionLimitIssueState;
    messages: string[];
};

type Props = {
    status: RequisitionLimitIssueStatus;
    className?: string;
    missingLabel?: string;
    exceedsLabel?: string;
};

export function RequisitionLimitIssueBlock({
    status,
    className,
    missingLabel = "Missing limit",
    exceedsLabel = "Exceeds limit",
}: Readonly<Props>) {
    if (status.state === "ok") {
        return null;
    }

    return (
        <div
            className={cn(
                "space-y-1 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-danger",
                className,
            )}
        >
            <div className="flex items-center gap-1.5 text-xs font-medium">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />

                <span>
                    {status.state === "missing-limit"
                        ? missingLabel
                        : exceedsLabel}
                </span>
            </div>

            <ul className="list-disc pl-5 text-xs">
                {status.messages.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                ))}
            </ul>
        </div>
    );
}