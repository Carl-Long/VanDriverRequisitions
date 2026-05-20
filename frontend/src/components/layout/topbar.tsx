"use client";

import clsx from "clsx";
import { SettingsPopover } from "./settings-popover";
import { UserMenu } from "./user-menu";

export function Topbar() {
  return (
    <header className={clsx(
      "flex h-16 items-center justify-between",
      "border-b border-border bg-surface",
      "px-2 pe-3 flex-shrink-0 w-full"
    )}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className={clsx(
            "h-8 w-8 rounded-lg",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "font-bold text-sm flex-shrink-0"
          )}>
            V
          </div>
          <h1 className="font-semibold text-base hidden sm:block">
            Van Driver Requisitions
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SettingsPopover isTopbar={true} />
        <div className="w-px h-6 bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}