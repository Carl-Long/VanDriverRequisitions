import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    className?: string;
};

export function DrawerFormActions({ children, className }: Readonly<Props>) {
    return (
        <div className={cn("mt-8 border-t border-border pt-5", className)}>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {children}
            </div>
        </div>
    );
}