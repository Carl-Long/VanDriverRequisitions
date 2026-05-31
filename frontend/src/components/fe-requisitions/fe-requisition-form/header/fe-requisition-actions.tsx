import { Button } from "@/components/ui/button/button";
import { ArrowRight, ArrowRightCircle, Save, Send } from "lucide-react";

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
                size="sm"
                disabled={isSaving}
                onClick={onSaveAndContinue}
                
            >
                <Save size={14} />
                <ArrowRightCircle size={14} />

                Save & Continue
            </Button>


            <Button
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={onSaveDraft}
            >
                <Save size={14} />

                {isSaving
                    ? "Saving..."
                    : "Save Draft"}
            </Button>

            {canSubmit && (
                <Button
                    size="sm"
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