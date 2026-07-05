import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type InactiveLookupWarningContext = "editable" | "readonly";

type Props = {
    label: string;
    variant?: "field" | "table";
    context?: InactiveLookupWarningContext;
    className?: string;
};

export function InactiveLookupWarning({
    label,
    variant = "table",
    context = "editable",
    className,
}: Readonly<Props>) {
    if (variant === "field") {
        const message =
            context === "readonly"
                ? `This ${label} is inactive and is shown for review.`
                : `This ${label} is inactive. Existing saved value is allowed, but if changed it cannot be selected again.`;

        return (
            <Alert tone="warning" className={cn("mb-0", className)}>
                {message}
            </Alert>
        );
    }

    return (
        <div className={cn("mt-1 text-xs font-medium text-warning", className)}>
            Inactive {label}
        </div>
    );
}