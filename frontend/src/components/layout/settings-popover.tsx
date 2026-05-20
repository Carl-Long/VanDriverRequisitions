"use client";

import { useState } from "react";
import { Settings, Palette, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { THEMES } from "@/lib/constants";

export function SettingsPopover({
    collapsed,
    isTopbar,
}: Readonly<{
    collapsed?: boolean;
    isTopbar?: boolean;
}>) {
    const [open, setOpen] = useState(false);
    const [submenu, setSubmenu] = useState<string | null>(null);
    const { theme, setTheme } = useTheme();

    const handleClose = () => {
        setOpen(false);
        setSubmenu(null);
    };

    return (
        <div className="relative">
            {/* BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-muted",
                    isTopbar ? "justify-center" : "w-full",
                    !isTopbar && !collapsed ? "justify-start" : "justify-center"
                )}
            >
                <Settings size={18} />
                {!collapsed && !isTopbar && <span className="text-sm">Settings</span>}
            </button>

            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0"
                    onClick={handleClose}
                    onKeyDown={(e) => e.key === "Escape" && handleClose()}
                    aria-hidden="true"
                />
            )}

            {/* MAIN MENU */}
            {open && submenu === null && (
                <div className={cn(
                    "absolute w-64 rounded-xl border border-border bg-surface shadow-xl p-1 z-50",
                    isTopbar ? "top-full mt-2 right-0" : "bottom-14 right-0"
                )}>
                    {/* Theme Option */}
                    <button
                        onClick={() => setSubmenu("theme")}
                        className="w-full flex items-center justify-between px-3 py-3 rounded-lg transition hover:bg-muted"
                    >
                        <div className="flex items-center gap-2">
                            <Palette size={16} className="text-primary" />
                            <span className="text-sm">Theme</span>
                        </div>
                        <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                </div>
            )}

            {/* SUBMENU - THEMES */}
            {open && submenu === "theme" && (
                <div className={cn(
                    "absolute w-64 rounded-xl border border-border bg-surface shadow-xl p-1 z-50",
                    isTopbar ? "top-full mt-2 right-0" : "bottom-14 right-0"
                )}>
                    {/* Back button */}
                    <button
                        onClick={() => setSubmenu(null)}
                        className="w-full text-left px-3 py-2 rounded-lg transition hover:bg-muted text-sm text-muted-foreground mb-1"
                    >
                        ← Back
                    </button>

                    <div className="border-t border-border/30 my-1" />

                    {/* Theme items */}
                    <div className="space-y-1">
                        {THEMES.map((t) => {
                            const active = theme === t.value;
                            return (
                                <button
                                    key={t.value}
                                    onClick={() => {
                                        setTheme(t.value);
                                        handleClose();
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg transition text-sm",
                                        active
                                            ? "bg-primary text-primary-foreground font-medium"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}