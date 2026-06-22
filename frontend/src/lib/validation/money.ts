export const MIN_MONEY_AMOUNT = 0.01;

export function hasMaxTwoDecimalPlaces(value: number) {
    return Number.isInteger(Number((value * 100).toFixed(8)));
}