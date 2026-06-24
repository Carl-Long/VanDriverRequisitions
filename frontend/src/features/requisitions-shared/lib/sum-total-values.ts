export type HasTotalValue = {
    totalValue?: number | null;
};

export function sumTotalValues(rows: readonly HasTotalValue[]): number {
    return rows.reduce((sum, row) => sum + (row.totalValue ?? 0), 0);
}