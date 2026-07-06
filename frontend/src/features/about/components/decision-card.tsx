import { decisionCards } from "../about-page-content";
import { AboutCard } from "./about-card";

export function DecisionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {decisionCards.map((decision) => (
        <AboutCard key={decision.title}>
          <h3 className="text-base font-semibold text-foreground">
            {decision.title}
          </h3>

          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-foreground">Problem</dt>
              <dd className="mt-1 text-muted-foreground">{decision.problem}</dd>
            </div>

            <div>
              <dt className="font-medium text-foreground">Decision</dt>
              <dd className="mt-1 text-muted-foreground">{decision.decision}</dd>
            </div>

            <div>
              <dt className="font-medium text-foreground">Reason</dt>
              <dd className="mt-1 text-muted-foreground">{decision.reason}</dd>
            </div>
          </dl>
        </AboutCard>
      ))}
    </div>
  );
}