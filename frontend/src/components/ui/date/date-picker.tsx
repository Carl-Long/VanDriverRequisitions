"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useState } from "react";

import { formatDateGB } from "@/lib/format/date";
import { cn } from "@/lib/utils";
import { fieldBase } from "../field/fieldstyles";
import { FieldState, fieldStateMap } from "../theme/state";


type Props = {
    disabled?: boolean;
    value?: Date;
    onChange: (date: Date | undefined) => void;
    state?: FieldState;
};

export function DatePicker({
    disabled = false,
    value,
    onChange,
    state = "default",
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);

    return (
        <Popover.Root
            open={open}
            onOpenChange={(next) => {
                if (disabled) {
                    return;
                }

                setOpen(next);
            }}
        >
            <Popover.Trigger asChild>
                <button
                    disabled={disabled}
                    type="button"
                    className={cn(
                        fieldBase,
                        fieldStateMap[state],
                        "flex cursor-pointer items-center justify-between",
                        open &&
                        "border-primary ring-2 ring-primary/20",
                        !open && "hover:bg-muted",
                        disabled &&
                        "cursor-not-allowed opacity-60",
                    )}
                >
                    {value
                        ? formatDateGB(value)
                        : "Select date"}
                </button>
            </Popover.Trigger>

            <Popover.Content
                side="right"
                align="center"
                avoidCollisions={false}
                sideOffset={10}
                className="
                    z-50 rounded-xl border border-border
                    bg-surface-elevated p-3 shadow-xl
                    text-foreground
                "
            >
                <DayPicker
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    fixedWeeks
                    components={{
                        Chevron: ({
                            orientation,
                        }) =>
                            orientation === "left" ? (
                                <ChevronLeft className="h-4 w-4 text-primary" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-primary" />
                            ),
                    }}
                    classNames={{
                        selected:
                            "rounded-xl bg-primary text-primary-foreground hover:bg-primary",

                        today:
                            "text-primary",
                    }}
                />
            </Popover.Content>
        </Popover.Root>
    );
}