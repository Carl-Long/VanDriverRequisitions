import Link from "next/link";
import clsx from "clsx";
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
      className={clsx(
        "group flex h-full min-h-[240px] flex-col overflow-hidden",
        "rounded-2xl border border-border bg-surface",
        "transition-all duration-200",
        "hover:border-accent/30 hover:shadow-md"
      )}
    >
      <div className="p-5 flex flex-col h-full">
        {/* Icon */}
        <div className={clsx(
          "mb-4 flex h-11 w-11 items-center justify-center",
          "rounded-xl bg-primary/10 text-primary"
        )}>
          <Icon size={22} strokeWidth={2} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Spacer pushes CTA down */}
        <div className="mt-auto pt-5">
          <div className={clsx(
            "flex items-center justify-between",
            "rounded-xl bg-accent/10 px-3 py-2",
            "text-sm font-medium text-primary",
            "transition-colors group-hover:bg-accent/20"
          )}>
            <span>Open workspace</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}