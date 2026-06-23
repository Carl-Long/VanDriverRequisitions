import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";
import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";

export function mapStdCollectionVanPackDraftToForm(
    row: StdCollectionVanPackDraft,
): StdCollectionVanPackForm {
    return {
        deliveryDate: row.deliveryDate,
        postCodeZone: row.postCodeZone ?? "",
        vanPacksOut: row.vanPacksOut,
        filledBags: row.filledBags,
    };
}