import type { ComboboxOption } from "@/components/ui/field/combobox";
import type { ShopLookup } from "@/lib/api/shops";

export function toShopOption(shop: ShopLookup): ComboboxOption {
    return {
        value: shop.id,
        label: `${shop.code} - ${shop.name}`,
        data: shop,
    };
}

export function toShopOptions(shops: ShopLookup[]): ComboboxOption[] {
    return shops.map(toShopOption);
}