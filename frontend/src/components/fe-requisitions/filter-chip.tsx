import { X } from "lucide-react";
import { IconButton } from "../ui/button/icon-button";

type Props = {
    label: string;
    onRemove: () => void;
};

export function FilterChip({
    label,
    onRemove,
}: Readonly<Props>) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground">
            {label}

            <IconButton
                size="xs"
                tone="accent"
                variant="ghost"
                onClick={onRemove}
                aria-label={`Remove filter: ${label}`}
            >
                <X size={12} />
            </IconButton>
        </span>
    );
}