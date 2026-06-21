import type { StdPickupForm } from "../types/std-pickup-form";

export function createEmptyStdPickupForm(
    date: Date | null = null,
): StdPickupForm {
    return {
        date: date ?? new Date(),
        numberOfBags: null,
        numberOfHouseholds: null,
        chargeType: "Mileage",
        miles: null,
        ratePerMile: null,
        flatCharge: null,
    };
}