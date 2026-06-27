"use client";

import { ReactNode, useState } from "react";

import { MobileSidebarDrawer } from "./mobile-sidebar-drawer";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground print:block print:h-auto print:min-h-0 print:overflow-visible">
            <div className="print:hidden">
                <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col print:block print:overflow-visible">
                <div className="print:hidden">
                    <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

                    <MobileSidebarDrawer
                        open={mobileSidebarOpen}
                        onClose={() => setMobileSidebarOpen(false)}
                    />
                </div>

                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto py-4 xl:py-8 2xl:py-12 print:block print:h-auto print:min-h-0 print:overflow-visible print:py-0">
                    {children}
                </main>
            </div>
        </div>
    );
}