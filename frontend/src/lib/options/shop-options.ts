import type { ComboboxOption } from "@/components/ui/field/combobox";
import type { ShopLookup } from "@/lib/api/shops";

export type ShopOption = ComboboxOption;

export function toShopOption(shop: ShopLookup): ShopOption {
    return {
        value: shop.id,
        label: `${shop.code} - ${shop.name}`,
    };
}

export function toShopOptions(shops: ShopLookup[]): ShopOption[] {
    return shops.map(toShopOption);
}
