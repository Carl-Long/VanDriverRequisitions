"use client";

import { useState } from "react";
import clsx from "clsx";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* AVATAR BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "flex h-9 w-9 items-center justify-center",
          "rounded-full bg-primary text-primary-foreground",
          "font-semibold text-sm",
          "hover:opacity-90 transition cursor-pointer"
        )}
        title="User profile"
      >
        C
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
        <div className={clsx(
          "absolute top-full mt-2 right-0 w-56",
          "rounded-lg border border-border bg-surface",
          "shadow-lg z-50"
        )}>
          {/* User Info */}
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-medium">Carl</p>
            <p className="text-xs text-muted-foreground">carl@example.com</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button className={clsx(
              "w-full flex items-center gap-3 px-4 py-2 text-sm",
              "hover:bg-muted transition text-left"
            )}>
              <User size={16} />
              Profile
            </button>

            <button className={clsx(
              "w-full flex items-center gap-3 px-4 py-2 text-sm",
              "hover:bg-muted transition text-left text-red-600"
            )}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
