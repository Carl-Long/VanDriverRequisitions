import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes } from "react";
import { FieldState, fieldStateMap } from "../theme/state";
import { fieldBase } from "./fieldstyles";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    state?: FieldState;
};

export function Textarea({
    state = "default",
    className,
    ...props
}: TextareaProps) {
    return (
        <textarea
            className={cn(
                fieldBase,
                fieldStateMap[state],
                "min-h-28 resize-y py-2",
                className,
            )}
            {...props}
        />
    );
}