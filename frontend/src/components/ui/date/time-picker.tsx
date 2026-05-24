type Props = {
  value?: string;
  onChange: (value: string) => void;
};

const hours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

const minutes = ["00", "15", "30", "45"];

export function TimePicker({ value = "09:00", onChange }: Readonly<Props>) {
  const [hour = "09", minute = "00"] = value.split(":");

  return (
    <div className="flex gap-2">
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="
          h-10 rounded-lg border border-border
          bg-surface-elevated px-3 text-sm text-foreground cursor-pointer
        "
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="
          h-10 rounded-lg border border-border
          bg-surface-elevated px-3 text-sm text-foreground cursor-pointer
        "
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}