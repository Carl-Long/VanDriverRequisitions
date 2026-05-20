"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

const themes = [
  {
    label: "Light Brand",
    value: "light-brand",
  },
  {
    label: "Dark Brand",
    value: "dark-brand",
  },
  {
    label: "Light Mono",
    value: "light-mono",
  },
  {
    label: "Dark Mono",
    value: "dark-mono",
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <Palette size={16} className="text-primary" />

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="
          bg-transparent
          text-sm
          outline-none
        "
      >
        {themes.map((t) => (
          <option
            key={t.value}
            value={t.value}
            className="text-black"
          >
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}