import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Topbar />
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto py-6 lg:py-8 xl:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
