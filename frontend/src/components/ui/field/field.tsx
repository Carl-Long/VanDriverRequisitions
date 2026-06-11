import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
};

export function Field({ label, error, hint, required, className, children }: Readonly<FieldProps>) {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="block text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="ml-1 text-danger">*</span>}
                </label>
            )}

            {children}

            <div className="space-y-1">
                {error && <p className="text-xs text-danger">{error}</p>}

                {hint && (
                    <p className={cn("text-xs text-muted-foreground", error && "opacity-70")}>
                        {hint}
                    </p>
                )}
            </div>
        </div>
    );
}
