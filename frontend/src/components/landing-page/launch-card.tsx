import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { LaunchCardProps } from "@/lib/types";

export function LaunchCard({
    title,
    description,
    href,
    icon: Icon,
}: Readonly<LaunchCardProps>) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex h-full min-h-[200px] flex-col overflow-hidden",
                "rounded-2xl border border-border bg-surface",
                "card-shadow-interactive transition-all duration-300",
                "hover:-translate-y-1 hover:border-primary/20"
            )}
        >
            <div className="flex flex-1 flex-col p-6">
                {/* Icon */}
                <div
                    className={cn(
                        "mb-5 flex h-12 w-12 flex-shrink-0 items-center justify-center",
                        "rounded-xl bg-primary/10 text-primary",
                        "transition-colors duration-300 group-hover:bg-primary/[0.15]"
                    )}
                >
                    <Icon size={22} strokeWidth={1.75} />
                </div>

                {/* Text */}
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                    {title}
                </h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>

                {/* CTA */}
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