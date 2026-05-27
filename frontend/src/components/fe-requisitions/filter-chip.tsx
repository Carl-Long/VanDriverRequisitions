import { X } from "lucide-react";

type Props = {
    label: string;
    onRemove: () => void;
};

export function FilterChip({
    label,
    onRemove,
}: Readonly<Props>) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
            {label}

            <button
                type="button"
                onClick={onRemove}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={`Remove filter: ${label}`}
            >
                <X size={12} />
            </button>
        </span>
    );
}