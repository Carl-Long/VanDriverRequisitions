import { formatCurrencyGB } from "@/lib/format/currency";

type Props = {
    value: number;
};

export function StdTotalValueCard({ value }: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface-subtle p-4">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Value</span>

                <span className="font-medium">{formatCurrencyGB(value)}</span>
            </div>
        </div>
    );
}