type Args = {
    previousId: string | null;
    previousIsActive: boolean;
    nextId: string | null;
};

export function resolveSelectedLookupActiveState({ previousId, previousIsActive, nextId, }: Args): boolean {
    if (!nextId) {
        return true;
    }

    if (previousIsActive === false && nextId === previousId) {
        return false;
    }

    return true;
}