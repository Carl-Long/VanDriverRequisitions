import { formatCurrencyGB } from "@/lib/format/currency";

type Props = {
    subtotal: number;
    generalTaskCount: number;
};

export function FeRequisitionSummaryMetrics({
    subtotal,
    generalTaskCount,
}: Readonly<Props>) {
    return (
        <div className="flex items-center gap-3">
            <MetricCard
                label="Subtotal"
                value={formatCurrencyGB(subtotal)}
            />

            <MetricCard
                label="Tasks"
                value={String(
                    generalTaskCount,
                )}
            />
        </div>
    );
}

type MetricCardProps = {
    label: string;
    value: string;
};

function MetricCard({
    label,
    value,
}: Readonly<MetricCardProps>) {
    return (
        <div className="min-w-[120px] rounded-xl border border-border bg-background px-4 py-3">
            <div className="text-xs text-muted-foreground">
                {label}
            </div>

            <div className="mt-1 text-lg font-semibold">
                {value}
            </div>
        </div>
    );
}