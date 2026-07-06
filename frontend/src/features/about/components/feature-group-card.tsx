import { featureGroups } from "../about-page-content";
import { AboutCard } from "./about-card";

export function FeatureGroupCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {featureGroups.map((group) => (
        <AboutCard key={group.title}>
          <h3 className="text-base font-semibold text-foreground">
            {group.title}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {group.description}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {group.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </AboutCard>
      ))}
    </div>
  );
}