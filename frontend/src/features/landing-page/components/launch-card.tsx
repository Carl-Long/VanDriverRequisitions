import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export type LaunchCardProps = {
    title: string;
    description: string;
    href: string;
    icon: ComponentType<LucideProps>;
};

export function LaunchCard({ title, description, href, icon: Icon }: Readonly<LaunchCardProps>) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex h-full min-h-[200px] flex-col overflow-hidden",
                "rounded-2xl border border-border bg-surface",
                "card-shadow-interactive transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary-border",
            )}
        >
            <div className="flex flex-1 flex-col p-6">
                <div
                    className={cn(
                        "mb-5 flex h-12 w-12 flex-shrink-0 items-center justify-center",
                        "rounded-xl border border-primary-border",
                        "bg-primary-surface text-primary",
                        "transition-colors duration-300",
                        "group-hover:bg-primary-surface-hover",
                    )}
                >
                    <Icon size={22} strokeWidth={1.85} />
                </div>

                <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>

                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>

                <div className="mt-5 flex items-center gap-1 text-sm font-medium text-primary">
                    <span>Open workspace</span>
                    <ArrowRight
                        size={14}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                </div>
            </div>
        </Link>
    );
}
