import type { ReactNode } from "react";

type Props = {
    title: string;
    description: string;
    summary: ReactNode;
    children: ReactNode;
};

export function SubmissionSectionCard({
    title,
    description,
    summary,
    children,
}: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-table-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">{title}</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>

                <p className="text-sm text-muted-foreground">{summary}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface print-table-wrapper">
                <div className="overflow-x-auto print-table-scroll">
                    {children}
                </div>
            </div>
        </div>
    );
}