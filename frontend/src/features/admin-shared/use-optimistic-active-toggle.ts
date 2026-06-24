import { Dispatch, SetStateAction, useState } from "react";

type ActiveItem = {
    id: string;
    isActive: boolean;
};

type Options<TItem extends ActiveItem> = {
    setItems: Dispatch<SetStateAction<TItem[]>>;
    showInactive: boolean;
    activate: (id: string) => Promise<void>;
    deactivate: (id: string) => Promise<void>;
    onBeforeToggle?: () => void;
    onSuccess?: (item: TItem, nextIsActive: boolean) => void;
    onError?: (error: unknown, item: TItem, nextIsActive: boolean) => void;
    afterSuccess?: () => void;
};

export function useOptimisticActiveToggle<TItem extends ActiveItem>({
    setItems,
    showInactive,
    activate,
    deactivate,
    onBeforeToggle,
    onSuccess,
    onError,
    afterSuccess,
}: Options<TItem>) {
    const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

    function setRowPending(id: string, pending: boolean) {
        setPendingIds((current) => {
            const next = new Set(current);

            if (pending) {
                next.add(id);
            } else {
                next.delete(id);
            }

            return next;
        });
    }

    async function toggleActive(item: TItem) {
        const nextIsActive = !item.isActive;

        onBeforeToggle?.();
        setRowPending(item.id, true);

        setItems((current) =>
            current.map((currentItem) =>
                currentItem.id === item.id
                    ? { ...currentItem, isActive: nextIsActive }
                    : currentItem,
            ),
        );

        try {
            if (item.isActive) {
                await deactivate(item.id);
            } else {
                await activate(item.id);
            }

            setItems((current) =>
                current.filter((currentItem) => showInactive || currentItem.isActive),
            );

            afterSuccess?.();
            onSuccess?.(item, nextIsActive);
        } catch (error) {
            setItems((current) =>
                current.map((currentItem) =>
                    currentItem.id === item.id ? item : currentItem,
                ),
            );

            onError?.(error, item, nextIsActive);
        } finally {
            setRowPending(item.id, false);
        }
    }

    return {
        pendingIds,
        toggleActive,
    };
}