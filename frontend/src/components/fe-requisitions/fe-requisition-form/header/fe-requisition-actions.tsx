import { Button } from "@/components/ui/button/button";

type Props = {
    isSaving: boolean;
    onSaveDraft: () => void;
    onSaveAndContinue: () => void;
    onSubmit: () => void;
};

export function FeRequisitionActions({
    isSaving,
    onSaveDraft,
    onSaveAndContinue,
    onSubmit,
}: Readonly<Props>) {


    return (
        <div className="flex items-center gap-3">

            <Button
                type="button"
                disabled={isSaving}
                onClick={onSaveDraft}

            >
                {isSaving
                    ? "Saving..."
                    : "Save Draft"}
            </Button>

            <Button
                type="button"
                disabled={isSaving}
                onClick={onSaveAndContinue}
            >
                Save & Continue
            </Button>

            <Button
                type="button"
                disabled={isSaving}
                onClick={onSubmit}
            >
                Submit
            </Button>
        </div>
    );
}