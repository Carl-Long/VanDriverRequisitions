import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";
import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";

export function calculateStdCollectionVanPackUnusedVanPacks(
    form: Pick<StdCollectionVanPackForm, "vanPacksOut" | "filledBags">,
) {
    return Math.max((form.vanPacksOut ?? 0) - (form.filledBags ?? 0), 0);
}

export function calculateStdCollectionVanPackPercentReturned(
    form: Pick<StdCollectionVanPackForm, "vanPacksOut" | "filledBags">,
) {
    const vanPacksOut = form.vanPacksOut ?? 0;

    if (vanPacksOut === 0) {
        return 0;
    }

    const unused = calculateStdCollectionVanPackUnusedVanPacks(form);

    return (unused / vanPacksOut) * 100;
}

export function calculateStdCollectionVanPackFormTotal(
    form: Pick<StdCollectionVanPackForm, "vanPacksOut">,
    ratePerVanPack: number,
) {
    return (form.vanPacksOut ?? 0) * ratePerVanPack;
}

export function calculateStdCollectionVanPackRowsTotal(rows: StdCollectionVanPackDraft[]) {
    return rows.reduce((total, row) => total + (row.totalValue ?? 0), 0);
}