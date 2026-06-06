import { ReactNode } from "react";

type SummaryFieldProps = {
    label: string;
    value: ReactNode;
};

export function SummaryField({ label, value }: Readonly<SummaryFieldProps>) {
    return (
        <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </div>

            <div className="mt-1 text-sm font-medium">
                {value}
            </div>
        </div>
    );
}