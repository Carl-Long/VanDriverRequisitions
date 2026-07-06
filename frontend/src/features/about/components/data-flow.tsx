const steps = [
  "API detail DTO",
  "Editable draft",
  "Drawer form",
  "Zod validation",
  "Draft update",
  "Save request DTO",
  ".NET API",
];

export function DataFlow() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground">
              {step}
            </div>

            {index < steps.length - 1 && (
              <span className="hidden text-muted-foreground md:inline">→</span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        The frontend keeps API data, editable draft state, drawer form state, and save
        requests separate. That keeps UI-only state out of API contracts and makes each
        validation boundary easier to reason about.
      </p>
    </div>
  );
}