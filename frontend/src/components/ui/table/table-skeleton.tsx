type Props = {
    rows?: number;
};

export function TableSkeleton({
    rows = 5,
}: Readonly<Props>) {
    return (
        <div className="overflow-hidden rounded-xl border border-border">
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="h-14 animate-pulse border-b border-border bg-surface last:border-b-0"
                />
            ))}
        </div>
    );
}