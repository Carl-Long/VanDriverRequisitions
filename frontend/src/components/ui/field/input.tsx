import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";
import { FieldState, fieldStateMap } from "../theme/state";
import { fieldBase } from "./fieldstyles";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    state?: FieldState;
};

export function Input({ state = "default", className, ...props }: InputProps) {
    return (
        <input
            className={cn(fieldBase, fieldStateMap[state], className)}
            {...props}
        />
    );
}