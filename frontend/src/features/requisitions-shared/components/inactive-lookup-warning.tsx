import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type Props = {
    label: string;
    variant?: "field" | "table";
    className?: string;
};

export function InactiveLookupWarning({ label, variant = "table", className, }: Readonly<Props>) {
    if (variant === "field") {
        return (
            <Alert tone="warning" className={cn("mb-0", className)}>
                This {label} is inactive. Existing saved value is allowed, but if changed it cannot be selected again.
            </Alert>
        );
    }

    return (
        <div className={cn("mt-1 text-xs font-medium text-warning", className)}>
            Inactive {label}
        </div>
    );
}