"use client";

import { format } from "date-fns";
import { DatePicker } from "./date-picker";
import { TimePicker } from "./time-picker";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
};

export function DateTimePicker({ value, onChange }: Readonly<Props>) {
  function handleDateChange(date?: Date) {
    if (!date) return;

    if (value) {
      date.setHours(value.getHours());
      date.setMinutes(value.getMinutes());
    }

    onChange(date);
  }

  function handleTimeChange(time: string) {
    if (!value) return;

    const [hours, minutes] = time.split(":").map(Number);

    const next = new Date(value);
    next.setHours(hours);
    next.setMinutes(minutes);

    onChange(next);
  }

  return (
    <div className="space-y-2">
      <DatePicker
        value={value}
        onChange={handleDateChange}
      />

      <TimePicker
        value={value ? format(value, "HH:mm") : "09:00"}
        onChange={handleTimeChange}
      />
    </div>
  );
}