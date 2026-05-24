"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { useState } from "react";
import { formatDateGB } from "@/lib/format/date";
import { fieldBase } from "../field/fieldstyles";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

export function DatePicker({ value, onChange }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`
            ${fieldBase}
            flex items-center justify-between cursor-pointer
            ${open ? "border-primary ring-2 ring-primary/20" : "hover:bg-muted"}
        `}
        >
          {value ? formatDateGB(value) : "Select date"}
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="right"
        align="center"
        avoidCollisions={false}
        sideOffset={10}
        className="
          z-50 rounded-xl border border-border
          bg-surface-elevated p-3 shadow-xl text-foreground
        "
      >
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          fixedWeeks
          components={{
            Chevron: ({ orientation }) =>
              orientation === "left" ? (
                <ChevronLeft className="h-4 w-4 text-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-primary" />
              ),
          }}
          classNames={{
            selected:
              "bg-primary text-primary-foreground hover:bg-primary rounded-xl",
            today: "text-primary",
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}