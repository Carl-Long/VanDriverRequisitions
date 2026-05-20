"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { THEMES } from "@/lib/constants";

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
                {THEMES.map((t) => (
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
