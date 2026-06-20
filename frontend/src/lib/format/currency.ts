export function formatCurrencyGB(value: number): string {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(value);
}

export function toCurrencyMinorUnits(value: number) {
    return Math.round(value * 100);
}

export function areCurrencyAmountsEqual(left: number, right: number) {
    return toCurrencyMinorUnits(left) === toCurrencyMinorUnits(right);
}
