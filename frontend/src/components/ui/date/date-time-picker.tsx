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
    if (!date) {
      onChange(undefined);
      return;
    }

    // preserve existing time if present
    if (value) {
      onChange(applyTime(date, getTimeString(value)));
      return;
    }

    onChange(date);
  }

  function handleTimeChange(time: string) {
    if (!value) return;

    onChange(applyTime(value, time));
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="flex-1">
        <DatePicker value={value} onChange={handleDateChange} />
      </div>

      <div className="sm:w-[160px]">
        <TimePicker
          value={value ? getTimeString(value) : "09:00"}
          onChange={handleTimeChange}
        />
      </div>
    </div>
  );
}