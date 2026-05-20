"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft, HomeIcon } from "lucide-react";
import clsx from "clsx";

import { navigation, adminNavigation } from "@/lib/navigation";
import { NavItem } from "@/components/layout/nav-item";
import { SIDEBAR_COLLAPSE_KEY } from "@/lib/constants";

export function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  // persist state
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (saved) setCollapsed(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={clsx(
        "flex flex-col h-[calc(100vh-64px)]",
        "border-r border-border bg-surface",
        "transition-all duration-300 ease-in-out",
        "overflow-hidden",
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* NAVIGATION SECTION */}
      <div className="flex flex-col p-2">
        {/* COLLAPSE BUTTON - integrated into nav */}
        <div className="flex items-center justify-end px-1 mb-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg hover:bg-muted transition
            "
            aria-label="Toggle sidebar"
          >
            <PanelLeft
              size={18}
              className={`
                transition-transform duration-300 ease-in-out
                ${collapsed ? "rotate-180" : "rotate-0"}
              `}
            />
          </button>
        </div>

        {/* HOME */}
        <div>
          <NavItem
            href="/"
            label="Home"
            icon={HomeIcon}
            active={isActive("/")}
            collapsed={collapsed}
          />
        </div>

        {/* MAIN NAV */}
        <div className="mt-4 space-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.title}
              icon={item.icon}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </div>

        {/* ADMIN */}
        <div className="mt-6">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Admin
            </p>
          )}

          <div className="space-y-1">
            {adminNavigation[0].items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.title}
                icon={item.icon}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      </div>

    </aside>
  );
}