import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";

export function createEmptyStdCollectionVanPackForm(
    deliveryDate: Date | null = null,
): StdCollectionVanPackForm {
    return {
        deliveryDate: deliveryDate ?? new Date(),
        postCodeZone: "",
        vanPacksOut: null,
        filledBags: null,
    };
}