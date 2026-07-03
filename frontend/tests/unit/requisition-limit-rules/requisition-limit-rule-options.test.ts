import { describe, expect, it } from "vitest";

import {
    getCategoryOptionsForFascia,
    isCategoryAllowedForFascia,
    isFeGeneralTaskLimitRule,
} from "@/features/requisition-limit-rules/requisition-limit-rule-options";
import { FASCIAS } from "@/lib/constants/fascias";

describe("requisitionLimitRuleOptions", () => {
    it("returns FE category options for FE fascia", () => {
        const result = getCategoryOptionsForFascia(FASCIAS.FE).map(
            (option) => option.value,
        );

        expect(result).toEqual([
            "GeneralTask",
            "Mileage",
            "Transfer",
            "AdditionalCost",
        ]);
    });

    it("returns STD category options for STD fascia", () => {
        const result = getCategoryOptionsForFascia(FASCIAS.STD).map(
            (option) => option.value,
        );

        expect(result).toEqual([
            "Mileage",
            "FlatCharge",
            "VanPack",
        ]);
    });

    it("returns no category options before fascia is selected", () => {
        const result = getCategoryOptionsForFascia("");

        expect(result).toEqual([]);
    });

    it("allows only supported category and fascia combinations", () => {
        expect(isCategoryAllowedForFascia(FASCIAS.FE, "GeneralTask")).toBe(true);
        expect(isCategoryAllowedForFascia(FASCIAS.FE, "Transfer")).toBe(true);
        expect(isCategoryAllowedForFascia(FASCIAS.FE, "FlatCharge")).toBe(false);
        expect(isCategoryAllowedForFascia(FASCIAS.FE, "VanPack")).toBe(false);

        expect(isCategoryAllowedForFascia(FASCIAS.STD, "Mileage")).toBe(true);
        expect(isCategoryAllowedForFascia(FASCIAS.STD, "FlatCharge")).toBe(true);
        expect(isCategoryAllowedForFascia(FASCIAS.STD, "VanPack")).toBe(true);
        expect(isCategoryAllowedForFascia(FASCIAS.STD, "Transfer")).toBe(false);
        expect(isCategoryAllowedForFascia(FASCIAS.STD, "GeneralTask")).toBe(false);
    });

    it("identifies only FE GeneralTask as FE task-type-specific", () => {
        expect(isFeGeneralTaskLimitRule(FASCIAS.FE, "GeneralTask")).toBe(true);
        expect(isFeGeneralTaskLimitRule(FASCIAS.STD, "GeneralTask")).toBe(false);
        expect(isFeGeneralTaskLimitRule(FASCIAS.FE, "Mileage")).toBe(false);
        expect(isFeGeneralTaskLimitRule("", "GeneralTask")).toBe(false);
    });
});