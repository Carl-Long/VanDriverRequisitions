const layers = [
  {
    title: "API",
    description: "HTTP endpoints, request contracts, auth, and response handling.",
  },
  {
    title: "Application",
    description: "Use-case orchestration, DTO validation, mapping, and persistence coordination.",
  },
  {
    title: "Domain",
    description: "Aggregate rules, lifecycle transitions, child row ownership, and totals.",
  },
  {
    title: "Infrastructure",
    description: "EF Core, SQL Server persistence, migrations, and data access concerns.",
  },
];

export function ArchitectureFlow() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {layers.map((layer, index) => (
        <div key={layer.title} className="relative">
          <div className="h-full rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Layer {index + 1}
            </p>

            <h3 className="mt-2 text-base font-semibold text-foreground">
              {layer.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {layer.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}