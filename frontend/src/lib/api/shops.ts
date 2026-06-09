import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import type { ComboboxOption } from "@/components/ui/field/combobox";

const BASE = "/api/v1/shops";

export type ShopLookup = {
    id: string;
    code: string;
    name: string;
};

export type ShopSearchQuery = {
    search?: string;
    page?: number;
    pageSize?: number;
};

let cachedShopOptions: ComboboxOption[] | null = null;
let pendingShopOptionsRequest: Promise<ComboboxOption[]> | null = null;

export const shopsApi = { search: (query: ShopSearchQuery = {}) => {
        const params = new URLSearchParams();

        if (query.search) {
            params.set("search", query.search);
        }

        params.set("page", String(query.page ?? 1));
        params.set("pageSize", String(query.pageSize ?? 20));
        return apiFetch<PagedResult<ShopLookup>>(`${BASE}?${params}`);
    },

    getCachedOptions: async () => {
        if (cachedShopOptions) {
            return cachedShopOptions;
        }

        if (pendingShopOptionsRequest) {
            return pendingShopOptionsRequest;
        }

        pendingShopOptionsRequest = shopsApi
            .search({ pageSize: 1000})
            .then((res) => {
                cachedShopOptions = res.items.map((x) => ({
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