"use client";

import { applyTime, getTimeString } from "@/lib/format/date";

import { DatePicker } from "./date-picker";
import { TimePicker } from "./time-picker";

import { FieldState } from "../theme/state";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  state?: FieldState;
};

export function DateTimePicker({
  value,
  onChange,
  state = "default",
}: Readonly<Props>) {
  function handleDateChange(date?: Date) {
    if (!date) {
      onChange(undefined);
      return;
    }

    // Preserve existing time if present
    if (value) {
      onChange(
        applyTime(date, getTimeString(value))
      );

      return;
    }

    onChange(date);
  }

  function handleTimeChange(time: string) {
    if (!value) return;

    onChange(applyTime(value, time));
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className="flex-1">
        <DatePicker
          value={value}
          onChange={handleDateChange}
          state={state}
        />
      </div>

      <div className="sm:w-[160px]">
        <TimePicker
          value={
            value
              ? getTimeString(value)
              : "09:00"
          }
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}