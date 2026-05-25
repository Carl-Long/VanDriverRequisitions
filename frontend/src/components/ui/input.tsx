import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";
import { FieldState, fieldStateMap } from "./theme/state";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    state?: FieldState;
};

const base =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Input({ state = "default", className, ...props }: InputProps) {
    return (
        <input
            className={cn(base, fieldStateMap[state], className)}
            {...props}
        />
    );
}