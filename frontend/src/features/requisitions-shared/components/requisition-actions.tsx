import { ArrowRightCircle, LogOut, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import type { RequisitionSaveAction } from "../types/requisition-save-action";

type Props = {
    activeAction: RequisitionSaveAction;
    canSubmit: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
};

export function RequisitionActions({
    activeAction,
    canSubmit,
    onSaveDraft,
    onSaveAndContinue,
    onSubmit,
}: Readonly<Props>) {
    const isBusy = activeAction !== null;

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                loading={activeAction === "saveAndContinue"}
                disabled={isBusy}
                onClick={onSaveAndContinue}
            >
                <Save size={14} />
                <ArrowRightCircle size={14} />
                Save & Continue
            </Button>

            <Button
                variant="outline"
                loading={activeAction === "saveAndClose"}
                disabled={isBusy}
                onClick={onSaveDraft}
            >
                <Save size={14} />
                <LogOut size={14} />
                Save & Close
            </Button>

            {canSubmit && (
                <Button
                    tone="danger"
                    loading={activeAction === "submit"}
                    disabled={isBusy}
                    onClick={onSubmit}
                >
                    <Send size={14} />
                    Submit
                </Button>
            )}
        </div>
    );
}