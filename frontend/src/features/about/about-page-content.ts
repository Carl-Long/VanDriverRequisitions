import {
  Braces,
  Database,
  Layers3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type AboutSectionId =
  | "introduction"
  | "tech-stack"
  | "architecture"
  | "feature-set"
  | "frontend-data-flow"
  | "validation"
  | "lifecycle"
  | "ux-decisions"
  | "learning-notes";

export type AboutSectionLink = {
  id: AboutSectionId;
  label: string;
};

export const aboutSectionLinks: AboutSectionLink[] = [
  { id: "introduction", label: "Introduction" },
  { id: "tech-stack", label: "Tech stack" },
  { id: "architecture", label: "Architecture" },
  { id: "feature-set", label: "Feature set" },
  { id: "frontend-data-flow", label: "Frontend data flow" },
  { id: "validation", label: "Validation" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "ux-decisions", label: "UX decisions" },
  { id: "learning-notes", label: "Learning notes" },
];

export type TechStackGroup = {
  title: string;
  icon: LucideIcon;
  items: string[];
};

export const techStackGroups: TechStackGroup[] = [
  {
    title: "Frontend",
    icon: Braces,
    items: ["Next.js", "React", "TypeScript", "React Hook Form", "Zod", "Tailwind CSS"],
  },
  {
    title: "Backend",
    icon: Database,
    items: [".NET 10 Web API", "Entity Framework Core", "SQL Server", "FluentValidation"],
  },
  {
    title: "Architecture",
    icon: Layers3,
    items: ["Clean Architecture", "DDD-style aggregates", "DTO mapping", "Snapshot history"],
  },
  {
    title: "Quality Control",
    icon: ShieldCheck,
    items: ["xUnit", "Moq", "Vitest", "Optimistic concurrency"],
  },
];

export type FeatureGroup = {
  title: string;
  description: string;
  items: string[];
};

export const featureGroups: FeatureGroup[] = [
  {
    title: "Requisition workflows",
    description: "Separate FE and STD flows with shared lifecycle concepts.",
    items: ["Draft save", "Submit", "Approval review", "Reject and resubmit", "Readonly approved view"],
  },
  {
    title: "Child collection editing",
    description: "Drawer-based editing for row-heavy requisition sections.",
    items: ["General Tasks", "Mileage", "Transfers", "Pickups", "Banks & Bins", "Van Pack Collections", "Additional Costs"],
  },
  {
    title: "Operational safeguards",
    description: "Rules that protect historical data and prevent invalid saves.",
    items: ["Inactive lookup handling", "Warning vs blocker tabs", "Limit validation", "Row version concurrency"],
  },
];

export type DecisionCard = {
  title: string;
  problem: string;
  decision: string;
  reason: string;
};

export const decisionCards: DecisionCard[] = [
  {
    title: "MVC to API-first architecture",
    problem:
      "Traditional MVC applications often couple page rendering, form handling, validation, and business workflow concerns together.",
    decision:
      "Use a Next.js frontend backed by a .NET Web API, with API contracts separating the UI from backend application logic.",
    reason:
      "This makes the frontend more flexible, gives the backend clearer use-case boundaries, and creates a better foundation for modern UI workflows.",
  },
  {
    title: "Explicit FE and STD requisition flows",
    problem:
      "The two requisition types share a lifecycle but have different row types, lookup rules, and business calculations.",
    decision:
      "Keep FE and STD as explicit feature areas while sharing common lifecycle, validation, layout, and persistence patterns.",
    reason:
      "This avoids over-generalising business logic while still reducing duplication where the behaviour is genuinely shared.",
  },
  {
    title: "Draft, form, and API model separation",
    problem:
      "API responses, editable screen state, drawer form state, and save requests have similar but different responsibilities.",
    decision:
      "Use separate detail DTOs, draft models, form models, and save request mappers.",
    reason:
      "This keeps API contracts clean, protects unsaved edits, and makes row-level validation easier to reason about.",
  },
  {
    title: "Warning vs blocker issue model",
    problem:
      "Some issues should be visible to users but still allow saving, while other issues represent invalid business data.",
    decision:
      "Use warning and blocker states across tabs, rows, and save actions.",
    reason:
      "Users can distinguish historical or informational issues from problems that must be fixed before saving or submitting.",
  },
  {
    title: "Inactive lookup handling",
    problem:
      "Saved requisitions can reference shops, drivers, reasons, or locations that later become inactive.",
    decision:
      "Preserve existing inactive values for historical accuracy, but prevent users from selecting inactive values for new changes.",
    reason:
      "This keeps older requisitions understandable without allowing new work to depend on inactive lookup data.",
  },
  {
    title: "Submission snapshots",
    problem:
      "Approved and historical submissions should remain stable even if lookup names, rates, or related data change later.",
    decision:
      "Capture submission snapshots when requisitions are submitted.",
    reason:
      "Approval, history, and print views can show what was submitted at the time, rather than recalculating against changed live data.",
  },
];