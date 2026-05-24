"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function UserMenu() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

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
                    onClick={() => setOpen(false)}
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
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">{user.role}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm",
                            "hover:bg-muted transition text-left"
                        )}>
                            <User size={16} />
                            Profile
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
                </div>
            )}
        </div>
    );
}
