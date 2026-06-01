import { Button } from "@/components/ui/button/button";
import { ArrowRight, ArrowRightCircle, LogOut, Save, Send } from "lucide-react";

type Props = {
    isSaving: boolean;
    canSubmit: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
};

export function FeRequisitionActions({
    isSaving,
    canSubmit,
    onSaveDraft,
    onSaveAndContinue,
    onSubmit,
}: Readonly<Props>) {


    return (
        <div className="flex flex-wrap items-center gap-3">

            <Button
                disabled={isSaving}
                onClick={onSaveAndContinue}
                
            >
                <Save size={14} />
                <ArrowRightCircle size={14} />

                Save & Continue
            </Button>


            <Button
                variant="outline"
                disabled={isSaving}
                onClick={onSaveDraft}
            >
                <Save size={14} />
                <LogOut size={14} />

                {isSaving
                    ? "Saving..."
                    : "Save And Close"}
            </Button>

            {canSubmit && (
                <Button
                    tone="danger"
                    disabled={isSaving}
                    onClick={onSubmit}
                >
                    <Send size={14} />

                    Submit
                </Button>
            )}
        </div>
    );
}