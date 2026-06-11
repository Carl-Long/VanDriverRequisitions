"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronLeft, LogOut, Palette, Type, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "next-themes";
import { TEXT_SIZES, THEMES } from "@/lib/constants/constants";
import { useTextSize } from "@/providers/text-size-provider";

export function UserMenu() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [submenu, setSubmenu] = useState<string | null>(null);
    const { theme, setTheme } = useTheme();
    const { textSize, setTextSize } = useTextSize();

    if (!user) return null;

    return (
        <div className="relative">
            {/* AVATAR BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-9 w-9 items-center justify-center",
                    "rounded-full bg-primary text-primary-foreground",
                    "font-semibold text-sm",
                    "hover:opacity-90 transition cursor-pointer"
                )}
                title="User profile"
            >
                {user.initial}
            </button>

            {/* BACKDROP */}
            {open && (
                <div
                    className="fixed inset-0"
                    onClick={() => {
                        setOpen(false);
                        setSubmenu(null);
                    }}
                    onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* DROPDOWN MENU */}
            {open && (
                <div className={cn(
                    "absolute top-full mt-2 right-0 w-56",
                    "rounded-lg border border-border bg-surface",
                    "shadow-lg z-50"
                )}>
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                            <User
                                size={14}
                                className="text-muted-foreground"
                            />

                            <p className="text-sm font-medium">
                                {user.name}
                            </p>
                        </div>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            {user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                                <span
                                    key={role}
                                    className={cn(
                                        "rounded-full border border-border",
                                        "bg-muted px-2 py-0.5",
                                        "text-xs text-muted-foreground"
                                    )}
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Menu Items */}
                    {submenu === null && (
                        <div className="py-1">
                            <button
                                onClick={() =>
                                    setSubmenu("theme")
                                }
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2 text-sm",
                                    "hover:bg-muted transition text-left"
                                )}
                            >
                                <Palette size={16} />
                                Theme
                            </button>

                            <button
                                onClick={() => setSubmenu("text-size")}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2 text-sm",
                                    "hover:bg-muted transition text-left"
                                )}
                            >
                                <Type size={16} />
                                Text size
                            </button>

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    logout();
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2 text-sm",
                                    "hover:bg-muted transition text-left text-danger"
                                )}
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>

                        </div>
                    )}

                    {submenu === "theme" && (
                        <div className="py-1">

                            <button
                                onClick={() =>
                                    setSubmenu(null)
                                }
                                className={cn(
                                    "w-full flex items-center gap-2 px-4 py-2 text-sm",
                                    "hover:bg-muted transition text-left"
                                )}
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>

                            <div className="my-1 border-t border-border/50" />

                            {THEMES.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => {
                                        setTheme(t.value);
                                    }}
                                    className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm hover:bg-muted"
                                >
                                    <span>{t.label}</span>

                                    {theme === t.value && (
                                        <Check size={16} />
                                    )}
                                </button>
                            ))}

                        </div>
                    )}

                    {submenu === "text-size" && (
                        <div className="py-1">

                            <button
                                onClick={() => setSubmenu(null)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-4 py-2 text-sm",
                                    "hover:bg-muted transition text-left"
                                )}
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>

                            <div className="my-1 border-t border-border/50" />

                            {TEXT_SIZES.map((size) => (
                                <button
                                    key={size.value}
                                    onClick={() => {
                                        setTextSize(size.value);
                                    }}
                                    className="flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-sm hover:bg-muted"
                                >
                                    <span>{size.label}</span>

                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                "font-medium text-foreground-subtle",
                                                size.value === "default" && "text-sm",
                                                size.value === "large" && "text-base",
                                                size.value === "extra-large" && "text-lg",
                                                size.value === "largest" && "text-xl"
                                            )}
                                        >
                                            Aa
                                        </span>

                                        {textSize === size.value && (
                                            <Check size={16} />
                                        )}
                                    </div>
                                </button>
                            ))}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
