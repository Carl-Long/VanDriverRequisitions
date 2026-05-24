"use client";

import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useState } from "react";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};


export function DatePicker({ value, onChange, }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`
            flex h-10 w-full items-center justify-between
            rounded-lg border px-3 text-sm
            transition-colors cursor-pointer
            text-foreground

            ${open
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:bg-muted"
            }
          `}
        >
          {value
            ? format(value, "dd MMM yyyy")
            : "Select date"}
        </button>
      </Popover.Trigger>

      <Popover.Content
        sideOffset={8}
        className="
                    z-50
                    rounded-xl
                    border
                    border-border
                    bg-surface-elevated
                    p-3
                    shadow-xl
                    text-foreground
                "
      >
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          components={{
            Chevron: ({ orientation }) =>
              orientation === "left" ? (
                <ChevronLeft className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-primary" />
              ),
          }}
          classNames={{
            selected: "bg-primary text-primary-foreground hover:bg-primary rounded-xl",
            today: "text-primary",
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}