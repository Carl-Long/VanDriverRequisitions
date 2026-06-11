import { useState } from "react";

export function useCrudModal<T>() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);

    function openCreate() {
        setEditing(null);
        setOpen(true);
    }

    function openEdit(item: T) {
        setEditing(item);
        setOpen(true);
    }

    function close() {
        setOpen(false);
        setEditing(null);
    }

    return {
        open,
        editing,
        isEditing: editing !== null,
        openCreate,
        openEdit,
        close,
    };
}
