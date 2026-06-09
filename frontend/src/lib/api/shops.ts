import { apiFetch } from "@/lib/api/client";
import type { ComboboxOption } from "@/components/ui/field/combobox";

const BASE = "/api/v1/shops";

export type ShopLookup = {
    id: string;
    code: string;
    name: string;
};

let cachedShopOptions: ComboboxOption[] | null = null;
let pendingShopOptionsRequest: Promise<ComboboxOption[]> | null = null;

export const shopsApi = {
    getActiveLookups: () => {
        return apiFetch<ShopLookup[]>(`${BASE}/lookups`);
    },

    getCachedOptions: async () => {
        if (cachedShopOptions) {
            return cachedShopOptions;
        }

        if (pendingShopOptionsRequest) {
            return pendingShopOptionsRequest;
        }

        pendingShopOptionsRequest = shopsApi
            .getActiveLookups()
            .then((shops) => {
                cachedShopOptions = shops.map((x) => ({
                    value: x.id,
                    label: `${x.code} - ${x.name}`,
                    data: x,
                }));

                return cachedShopOptions;
            })
            .finally(() => {
                pendingShopOptionsRequest = null;
            });

        return pendingShopOptionsRequest;
    },

    clearCachedOptions: () => {
        cachedShopOptions = null;
        pendingShopOptionsRequest = null;
    },
};