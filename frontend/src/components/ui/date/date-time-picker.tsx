"use client";

import { applyTime, getTimeString } from "@/lib/format/date";
import { DatePicker } from "./date-picker";
import { TimePicker } from "./time-picker";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

export function DateTimePicker({ value, onChange }: Readonly<Props>) {
  function handleDateChange(date?: Date) {
    if (!date) return;

    // if we already have a time, preserve it
    if (value) {
      const next = applyTime(date, getTimeString(value));
      onChange(next);
      return;
    }

    onChange(date);
  }

  function handleTimeChange(time: string) {
    if (!value) return;

    const next = applyTime(value, time);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <DatePicker value={value} onChange={handleDateChange} />

      <TimePicker
        value={value ? getTimeString(value) : "09:00"}
        onChange={handleTimeChange}
      />
    </div>
  );
}