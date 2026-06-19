export const STD_CHARGE_TYPE = {
    Mileage: "Mileage",
    FlatCharge: "FlatCharge",
} as const;

export type StdChargeType = (typeof STD_CHARGE_TYPE)[keyof typeof STD_CHARGE_TYPE];

export const STD_CHARGE_TYPE_OPTIONS: { value: StdChargeType; label: string }[] = [
    { value: STD_CHARGE_TYPE.Mileage, label: "Mileage" },
    { value: STD_CHARGE_TYPE.FlatCharge, label: "Flat charge" },
];

export function getStdChargeTypeLabel(value: StdChargeType | string | null | undefined) {
    return STD_CHARGE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "Unknown";
}