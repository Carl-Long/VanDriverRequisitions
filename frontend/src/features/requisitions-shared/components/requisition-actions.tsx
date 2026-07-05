import { ArrowRightCircle, LogOut, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import type { RequisitionSaveAction } from "../types/requisition-save-action";

type Props = {
    activeAction: RequisitionSaveAction;
    canSubmit: boolean;
    hasKnownSaveBlockers?: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
};

export function RequisitionActions({
    activeAction,
    canSubmit,
    hasKnownSaveBlockers,
    onSaveDraft,
    onSaveAndContinue,
    onSubmit,
}: Readonly<Props>) {
    const isBusy = activeAction !== null;
    const saveDisabled = isBusy || hasKnownSaveBlockers;
    const submitDisabled = isBusy || hasKnownSaveBlockers || !canSubmit;

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                loading={activeAction === "saveAndContinue"}
                disabled={saveDisabled}
                onClick={onSaveAndContinue}
            >
                <Save className="size-[1em]" />
                <ArrowRightCircle className="size-[1em]" />
                Save & Continue
            </Button>

            <Button
                variant="outline"
                loading={activeAction === "saveAndClose"}
                disabled={saveDisabled}
                onClick={onSaveDraft}
            >
                <Save className="size-[1em]" />
                <LogOut className="size-[1em]" />
                Save & Close
            </Button>

            {canSubmit && (
                <Button
                    tone="danger"
                    loading={activeAction === "submit"}
                    disabled={submitDisabled}
                    onClick={onSubmit}
                >
                    <Send className="size-[1em]" />
                    Submit
                </Button>
            )}
        </div>
    );
}