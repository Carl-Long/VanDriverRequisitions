import { cn } from "@/lib/utils";

type LimitWarningStatus = {
    state: "ok" | "missing-limit" | "exceeds-limit";
    messages: string[];
};

type Props = {
    status: LimitWarningStatus;
    className?: string;
    missingLabel?: string;
    exceedsLabel?: string;
};

export function RequisitionLimitWarningBlock({
    status,
    className,
    missingLabel = "Missing limit",
    exceedsLabel = "Exceeds limit",
}: Readonly<Props>) {
    if (status.state === "ok") {
        return null;
    }

    return (
        <div className={cn("space-y-1", className)}>
            <div className="text-xs font-medium text-warning">
                {status.state === "missing-limit" ? missingLabel : exceedsLabel}
            </div>

            <ul className="list-disc pl-4 text-xs text-warning">
                {status.messages.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                ))}
            </ul>
        </div>
    );
}