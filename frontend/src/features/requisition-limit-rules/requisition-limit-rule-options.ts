import { FASCIAS,   } from "@/lib/constants/fascias";

import type {    RequisitionLimitRuleCategory,    RequisitionLimitRuleFascia,} from "./requisition-limit-rules-api";

type CategoryOption = {
    value: RequisitionLimitRuleCategory;
    label: string;
};

export const requisitionLimitRuleCategories = [
    "GeneralTask",
    "Mileage",
    "Transfer",
    "AdditionalCost",
    "FlatCharge",
    "VanPack",
] as const satisfies readonly RequisitionLimitRuleCategory[];

export const feCategoryOptions = [
    { value: "GeneralTask", label: "General Task" },
    { value: "Mileage", label: "Mileage" },
    { value: "Transfer", label: "Transfer" },
    { value: "AdditionalCost", label: "Additional Cost" },
] as const satisfies readonly CategoryOption[];

export const stdCategoryOptions = [
    { value: "Mileage", label: "Mileage" },
    { value: "FlatCharge", label: "Flat Charge" },
    { value: "VanPack", label: "Van Pack" },
] as const satisfies readonly CategoryOption[];

export const categoryOptions = [
    ...feCategoryOptions,
    ...stdCategoryOptions,
] as const satisfies readonly CategoryOption[];

export function getCategoryOptionsForFascia(
    fascia: RequisitionLimitRuleFascia | "",
): readonly CategoryOption[] {
    if (fascia === FASCIAS.FE) {
        return feCategoryOptions;
    }

    if (fascia === FASCIAS.STD) {
        return stdCategoryOptions;
    }

    return [];
}

export function isCategoryAllowedForFascia(
    fascia: RequisitionLimitRuleFascia | "",
    category: RequisitionLimitRuleCategory | "",
): boolean {
    if (!fascia || !category) {
        return false;
    }

    return getCategoryOptionsForFascia(fascia).some(
        (option) => option.value === category,
    );
}

export function isFeGeneralTaskLimitRule(
    fascia: RequisitionLimitRuleFascia | "",
    category: RequisitionLimitRuleCategory | "",
): boolean {
    return fascia === FASCIAS.FE && category === "GeneralTask";
}


export {REQUISITION_FASCIAS as requisitionLimitRuleFascias, FASCIA_OPTIONS as fasciaOptions} from "@/lib/constants/fascias";