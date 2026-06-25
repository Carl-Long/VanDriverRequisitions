import { Button } from "@/components/ui/button/button";

type Props = {
    isEditing: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    createLabel?: string;
    saveLabel?: string;
    cancelLabel?: string;
};

export function AdminModalFormActions({
    isEditing,
    isSubmitting,
    onCancel,
    createLabel = "Create",
    saveLabel = "Save Changes",
    cancelLabel = "Cancel",
}: Readonly<Props>) {
    return (
        <div className="flex justify-end gap-3 pt-2">
            <Button
                type="button"
                variant="outline"
                tone="primary"
                onClick={onCancel}
                disabled={isSubmitting}
            >
                {cancelLabel}
            </Button>

            <Button type="submit" loading={isSubmitting} tone="primary">
                {isEditing ? saveLabel : createLabel}
            </Button>
        </div>
    );
}