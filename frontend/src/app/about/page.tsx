import { Info } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { AboutSection } from "@/features/about/components/about-section";
import { AboutSectionNav } from "@/features/about/components/about-section-nav";
import { ArchitectureFlow } from "@/features/about/components/architecture-flow";
import { DataFlow } from "@/features/about/components/data-flow";
import { DecisionCards } from "@/features/about/components/decision-card";
import { FeatureGroupCards } from "@/features/about/components/feature-group-card";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";
import type { RequisitionStatus } from "@/features/requisitions-shared/constants/requisition-status.constants";
import { RequisitionStatusPill } from "@/features/requisitions-shared/components/requisition-status-pill";

const lifecycleStatuses: {
    status: RequisitionStatus;
    description: string;
}[] = [
        {
            status: "Draft",
            description: "Editable working state before submission.",
        },
        {
            status: "Submitted",
            description: "Locked for review by an approver.",
        },
        {
            status: "Rejected",
            description: "Returned for changes and resubmission.",
        },
        {
            status: "Approved",
            description: "Final readonly state with historical snapshot data.",
        },
    ];


export default function AboutPage() {
    return (
        <PageContainer>
            <PageHeader
                title="About this app"
                description="Technical notes on the stack, architecture, data flow, and design decisions used to explore a modern Next.js and .NET API approach for requisition-style business workflows."
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="min-w-0 space-y-10">
                    <AboutSection id="introduction" title="Introduction">
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-border bg-primary-surface text-primary">
                                    <Info className="size-[1.2em]" />
                                </div>

                                <div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Van Driver Requisitions is a full-stack requisition management application
                                        built to explore how an existing legacy business workflow could be
                                        modernised using a Next.js frontend and a .NET Web API backend.
                                    </p>

                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        I built this in my spare time and weekends as a learning exercise, with a
                                        focus on clean architecture, maintainable frontend state, clear validation
                                        boundaries, and practical UX for real data-entry workflows.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </AboutSection>

                    <AboutSection
                        id="tech-stack"
                        title="Tech stack"
                        description="The application uses a Next.js and TypeScript frontend with a .NET API and SQL Server persistence."
                    >
                        <TechStackGrid />
                    </AboutSection>

                    <AboutSection
                        id="architecture"
                        title="Architecture"
                        description="The backend uses Clean Architecture so API endpoints, application orchestration, domain rules, and persistence concerns stay separated."
                    >
                        <ArchitectureFlow />
                    </AboutSection>

                    <AboutSection
                        id="feature-set"
                        title="Feature set"
                        description="The app supports two parallel requisition flows with shared lifecycle concepts and domain-specific row types."
                    >
                        <FeatureGroupCards />
                    </AboutSection>

                    <AboutSection
                        id="frontend-data-flow"
                        title="Frontend data flow"
                        description="The frontend intentionally separates API contracts, editable draft state, drawer form state, and save request payloads."
                    >
                        <DataFlow />
                    </AboutSection>

                    <AboutSection
                        id="validation"
                        title="Validation strategy"
                        description="Validation is layered so the UI guides users early while the backend remains the source of truth."
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-border bg-surface p-5">
                                <h3 className="text-base font-semibold text-foreground">
                                    Frontend validation
                                </h3>

                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        Zod validates requisition drawer input before rows are added or updated.
                                    </li>
                                    <li>
                                        Requisition drawers use local form state so row edits can be validated and mapped back into the draft model.
                                    </li>
                                    <li>
                                        Admin modal forms use React Hook Form where standard field-level form handling is a better fit.
                                    </li>
                                    <li>
                                        Known warning and blocker states are surfaced before save or submit.
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-xl border border-border bg-surface p-5">
                                <h3 className="text-base font-semibold text-foreground">
                                    Backend validation
                                </h3>

                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        FluentValidation protects API request contracts before application logic runs.
                                    </li>
                                    <li>
                                        Domain aggregates enforce lifecycle rules, ownership rules, and child row consistency.
                                    </li>
                                    <li>
                                        Server-side limit validation prevents invalid requisitions from being persisted.
                                    </li>
                                    <li>
                                        Optimistic concurrency protects users from overwriting another user&apos;s changes.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </AboutSection>

                    <AboutSection
                        id="lifecycle"
                        title="Requisition lifecycle"
                        description="Both FE and STD requisitions follow the same broad status lifecycle."
                    >
                        <div className="rounded-xl border border-border bg-surface p-5">
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                                {lifecycleStatuses.map((item) => (
                                    <div
                                        key={item.status}
                                        className="rounded-lg border border-border bg-surface-elevated px-3 py-3"
                                    >
                                        <div className="flex justify-center">
                                            <RequisitionStatusPill status={item.status} />
                                        </div>

                                        <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                Draft and rejected requisitions can be edited. Submitted requisitions are reviewed
                                for approval or rejection. Approved requisitions are terminal and shown as readonly.
                                Submission snapshots preserve what was submitted at each point in the workflow.
                            </p>
                        </div>
                    </AboutSection>

                    <AboutSection
                        id="ux-decisions"
                        title="UX and business-rule decisions"
                        description="The UI is designed to support real data-entry workflows without hiding important business state."
                    >
                        <DecisionCards />
                    </AboutSection>

                    <AboutSection
                        id="learning-notes"
                        title="Learning notes and trade-offs"
                        description="A short summary of what this build was intended to explore."
                    >
                        <Alert tone="info" className="mb-0">
                            This app was built as a learning and modernisation prototype to explore how
                            requisition-style MVC workflows could move towards a Next.js frontend and
                            .NET API backend. The focus is on clear boundaries, realistic validation,
                            maintainable feature structure, and practical UX for business data-entry
                            workflows.
                        </Alert>
                    </AboutSection>
                </div>

                <aside className="hidden lg:block">
                    <AboutSectionNav />
                </aside>
            </div>
        </PageContainer>
    );
}