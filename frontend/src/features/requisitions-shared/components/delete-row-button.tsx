import { Trash2 } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";

type Props = {
    ariaLabel: string;
    onDelete: () => void;
};

export function DeleteRowButton({ ariaLabel, onDelete }: Readonly<Props>) {
    return (
        <IconButton
            type="button"
            tone="danger"
            variant="ghost"
            aria-label={ariaLabel}
            onClick={(event) => {
                event.stopPropagation();
                onDelete();
            }}
        >
            <Trash2 className="size-[1em]" />
        </IconButton>
    );
}