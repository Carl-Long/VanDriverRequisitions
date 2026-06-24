import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { DrawerFormActions } from "@/components/ui/drawer";

type Props = {
    isEditMode: boolean;
    onCancel: () => void;
    onSaveAndClose: () => void;
    addAndCloseLabel?: string;
    updateAndCloseLabel?: string;
    addAnotherLabel?: string;
    cancelLabel?: string;
};

export function RequisitionDrawerFormActions({
    isEditMode,
    onCancel,
    onSaveAndClose,
    addAndCloseLabel = "Add & Close",
    updateAndCloseLabel = "Update & Close",
    addAnotherLabel = "Add & Create Another",
    cancelLabel = "Cancel",
}: Readonly<Props>) {
    return (
        <DrawerFormActions>
            <Button type="button" tone="accent" onClick={onCancel}>
                {cancelLabel}
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Button
                    type="button"
                    className="min-w-[160px]"
                    variant="outline"
                    onClick={onSaveAndClose}
                >
                    {isEditMode ? updateAndCloseLabel : addAndCloseLabel}
                </Button>

                {!isEditMode && (
                    <Button type="submit" className="min-w-[160px]">
                        <Plus className="h-4 w-4" />
                        {addAnotherLabel}
                    </Button>
                )}
            </div>
        </DrawerFormActions>
    );
}