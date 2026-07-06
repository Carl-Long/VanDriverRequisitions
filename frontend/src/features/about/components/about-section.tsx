import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AboutSectionProps = {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AboutSection({
  id,
  title,
  description,
  children,
  className,
}: Readonly<AboutSectionProps>) {
  return (
    <section id={id} className={cn("scroll-mt-20", className)}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}