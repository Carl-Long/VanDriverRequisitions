import { Dispatch, SetStateAction, useState } from "react";
import type { PagedResult } from "@/lib/types";

type ActiveItem = {
    id: string;
    isActive: boolean;
};

type Options<TItem extends ActiveItem> = {
    setData: Dispatch<SetStateAction<PagedResult<TItem> | null>>;
    showInactive: boolean;
    activate: (id: string) => Promise<void>;
    deactivate: (id: string) => Promise<void>;
    onBeforeToggle?: () => void;
    onSuccess?: (item: TItem, nextIsActive: boolean) => void;
    onError?: (error: unknown, item: TItem, nextIsActive: boolean) => void;
    afterSuccess?: () => void;
};

export function useOptimisticPaginatedActiveToggle<TItem extends ActiveItem>({
    setData,
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

        setData((current) => {
            if (!current) return current;

            return {
                ...current,
                items: current.items.map((currentItem) =>
                    currentItem.id === item.id
                        ? { ...currentItem, isActive: nextIsActive }
                        : currentItem,
                ),
            };
        });

        try {
            if (item.isActive) {
                await deactivate(item.id);
            } else {
                await activate(item.id);
            }

            setData((current) => {
                if (!current) return current;

                const nextItems = current.items.filter(
                    (currentItem) => showInactive || currentItem.isActive,
                );

                const removedFromVisiblePage = nextItems.length < current.items.length;

                return {
                    ...current,
                    items: nextItems,
                    totalCount: removedFromVisiblePage
                        ? Math.max(0, current.totalCount - 1)
                        : current.totalCount,
                };
            });

            afterSuccess?.();
            onSuccess?.(item, nextIsActive);
        } catch (error) {
            setData((current) => {
                if (!current) return current;

                return {
                    ...current,
                    items: current.items.map((currentItem) =>
                        currentItem.id === item.id ? item : currentItem,
                    ),
                };
            });

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