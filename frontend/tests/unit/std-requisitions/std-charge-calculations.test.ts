import { describe, expect, it } from "vitest";

import { STD_CHARGE_TYPE } from "@/features/std-requisitions/constants/std-charge-type.constants";
import { calculateStdChargeTotal } from "@/features/std-requisitions/form/lib/calculate-std-charge-total";
import { normaliseStdChargeFields } from "@/features/std-requisitions/form/lib/normalise-std-charge-fields";
import type { StdChargeFields } from "@/features/std-requisitions/form/types/std-charge-fields";

function createChargeFields(
    overrides: Partial<StdChargeFields> = {},
): StdChargeFields {
    return {
        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 0,
        ratePerMile: 0,
        flatCharge: null,
        ...overrides,
    };
}

describe("calculateStdChargeTotal", () => {
    it("calculates mileage totals from miles and rate per mile", () => {
        const result = calculateStdChargeTotal(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
                miles: 12,
                ratePerMile: 0.45,
                flatCharge: 99,
            }),
        );

        expect(result).toBe(5.4);
    });

    it("treats null mileage values as zero", () => {
        const result = calculateStdChargeTotal(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
                miles: null,
                ratePerMile: null,
                flatCharge: 99,
            }),
        );

        expect(result).toBe(0);
    });

    it("uses flat charge directly for flat-charge rows", () => {
        const result = calculateStdChargeTotal(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                miles: 12,
                ratePerMile: 0.45,
                flatCharge: 10.5,
            }),
        );

        expect(result).toBe(10.5);
    });

    it("treats null flat charge as zero", () => {
        const result = calculateStdChargeTotal(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                miles: 12,
                ratePerMile: 0.45,
                flatCharge: null,
            }),
        );

        expect(result).toBe(0);
    });
});

describe("normaliseStdChargeFields", () => {
    it("keeps mileage fields and clears flat charge for mileage rows", () => {
        const result = normaliseStdChargeFields(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
                miles: 12,
                ratePerMile: 0.45,
                flatCharge: 10,
            }),
        );

        expect(result).toEqual({
            chargeType: STD_CHARGE_TYPE.Mileage,
            miles: 12,
            ratePerMile: 0.45,
            flatCharge: null,
        });
    });

    it("keeps flat charge and clears mileage fields for flat-charge rows", () => {
        const result = normaliseStdChargeFields(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                miles: 12,
                ratePerMile: 0.45,
                flatCharge: 10,
            }),
        );

        expect(result).toEqual({
            chargeType: STD_CHARGE_TYPE.FlatCharge,
            miles: null,
            ratePerMile: null,
            flatCharge: 10,
        });
    });
});