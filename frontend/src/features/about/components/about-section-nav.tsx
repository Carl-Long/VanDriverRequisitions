import Link from "next/link";

import { cn } from "@/lib/utils";
import { aboutSectionLinks } from "../about-page-content";

export function AboutSectionNav() {
  return (
    <>
      <nav
        aria-label="About page sections"
        className="hidden lg:sticky lg:top-16 lg:block"
      >
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </p>

          <div className="space-y-1">
            {aboutSectionLinks.map((section) => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className={cn(
                  "block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition",
                  "hover:bg-muted hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                {section.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <nav
        aria-label="About page sections"
        className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden"
      >
        {aboutSectionLinks.map((section) => (
          <Link
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "shrink-0 rounded-full border border-border bg-surface px-3 py-1.5",
              "text-xs font-medium text-muted-foreground transition",
              "hover:border-primary/40 hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {section.label}
          </Link>
        ))}
      </nav>
    </>
  );
}