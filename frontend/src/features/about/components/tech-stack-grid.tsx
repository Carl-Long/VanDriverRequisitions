import { techStackGroups } from "../about-page-content";
import { AboutCard } from "./about-card";

export function TechStackGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {techStackGroups.map((group) => (
        <AboutCard key={group.title}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-border bg-primary-surface text-primary">
              <group.icon className="size-[1.2em]" />
            </div>

            <h3 className="text-base font-semibold text-foreground">
              {group.title}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </AboutCard>
      ))}
    </div>
  );
}