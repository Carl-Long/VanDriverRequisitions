import { Button } from "@/components/ui/button/button";
import { ArrowRightCircle, LogOut, Save, Send } from "lucide-react";
import { SaveAction } from "../components/fe-requisition-shell";

type Props = {
    activeAction: SaveAction;
    canSubmit: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
};

export function FeRequisitionActions({
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
