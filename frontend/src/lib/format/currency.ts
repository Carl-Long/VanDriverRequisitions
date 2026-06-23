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

export function formatMoneyInputValue(value?: number | null): string {
    return value === null || value === undefined ? "" : value.toFixed(2);
}

export function parseMoneyInputValue(value: string): number | null {
    if (!value.trim()) {
        return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export function normaliseMoneyInputValue(value?: number | null): number | null {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return null;
    }

    return Number(value.toFixed(2));
}