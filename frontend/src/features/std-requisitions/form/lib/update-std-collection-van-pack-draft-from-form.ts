import { normaliseUkPostcodeOutwardCode } from "@/lib/validation/uk-postcode";

import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";
import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";
import {
    calculateStdCollectionVanPackFormTotal,
    calculateStdCollectionVanPackPercentReturned,
    calculateStdCollectionVanPackUnusedVanPacks,
} from "./calculate-std-collection-van-pack-form";

export function updateStdCollectionVanPackDraftFromForm(
    row: StdCollectionVanPackDraft,
    form: StdCollectionVanPackForm,
    ratePerVanPack: number,
): StdCollectionVanPackDraft {
    return {
        ...row,

        deliveryDate: form.deliveryDate,
        postCodeZone: normaliseUkPostcodeOutwardCode(form.postCodeZone),

        vanPacksOut: form.vanPacksOut,
        filledBags: form.filledBags,

        unusedVanPacks: calculateStdCollectionVanPackUnusedVanPacks(form),
        percentReturned: calculateStdCollectionVanPackPercentReturned(form),

        ratePerVanPack,
        totalValue: calculateStdCollectionVanPackFormTotal(form, ratePerVanPack),
    };
}