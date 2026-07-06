import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AboutCardProps = {
  children: ReactNode;
  className?: string;
};

export function AboutCard({ children, className }: Readonly<AboutCardProps>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}