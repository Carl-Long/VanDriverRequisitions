import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button/button";

type Props = {
    title: ReactNode;
    description: ReactNode;
    summary: ReactNode;
    actionLabel?: string;
    actionDisabled?: boolean;
    actionHidden?: boolean;
    onAction?: () => void;
};

export function RequisitionWorkspaceHeader({
    title,
    description,
    summary,
    actionLabel,
    actionDisabled = false,
    actionHidden = false,
    onAction,
}: Readonly<Props>) {
    const showAction = !!actionLabel && !!onAction && !actionHidden;

    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <h2 className="text-md font-semibold">{title}</h2>

                <p className="text-sm text-muted-foreground">{description}</p>

                <p className="text-sm text-muted-foreground">{summary}</p>
            </div>

            {showAction && (
                <Button type="button" disabled={actionDisabled} onClick={onAction}>
                    <Plus className="size-[1em]" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}