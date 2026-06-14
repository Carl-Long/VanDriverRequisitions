import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    href: string;
    children: React.ReactNode;
    compact?: boolean;
    className?: string;
};

export function BackLink({ href, children, compact = false, className }: Readonly<Props>) {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-surface-elevated hover:text-foreground",
                compact ? "px-3 py-1.5" : "px-3 py-2",
                className,
            )}
        >
            <ArrowLeft className="h-4 w-4" />
            {children}
        </Link>
    );
}