import { normaliseUkPostcodeOutwardCode } from "@/lib/validation/uk-postcode";
import type { StdCollectionVanPackDraft } from "../types/std-collection-van-pack-draft";
import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";
import {
    calculateStdCollectionVanPackFormTotal,
    calculateStdCollectionVanPackPercentReturned,
    calculateStdCollectionVanPackUnusedVanPacks,
} from "./calculate-std-collection-van-pack-form";

type Args = {
    form: StdCollectionVanPackForm;
    ratePerVanPack: number;
};

export function createStdCollectionVanPackDraftFromForm({
    form,
    ratePerVanPack,
}: Args): StdCollectionVanPackDraft {
    return {
        clientId: crypto.randomUUID(),
        id: null,

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