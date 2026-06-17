import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <div className="flex h-screen flex-col bg-background text-foreground print:block print:h-auto print:min-h-0 print:overflow-visible">
            <div className="print:hidden">
                <Topbar />
            </div>

            <div className="flex min-w-0 flex-1 overflow-hidden print:block print:overflow-visible">
                <div className="print:hidden">
                    <Sidebar />
                </div>

                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto py-4 xl:py-6 print:block print:h-auto print:min-h-0 print:overflow-visible print:py-0">
                    {children}
                </main>
            </div>
        </div>
    );
}