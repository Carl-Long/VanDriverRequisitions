import type { ComboboxOption } from "@/components/ui/field/combobox";
import type { RequisitionLimitRuleCategory, RequisitionLimitRuleFascia } from "./requisition-limit-rules-api";

export const requisitionLimitRuleCategories = [
    "GeneralTask",
    "Mileage",
    "Transfer",
    "AdditionalCost",
    "FlatCharge",
    "VanPack",
] as const satisfies readonly RequisitionLimitRuleCategory[];

export const categoryOptions = [
    { value: "GeneralTask", label: "General Task" },
    { value: "Mileage", label: "Mileage" },
    { value: "Transfer", label: "Transfer" },
    { value: "AdditionalCost", label: "Additional Cost" },
    { value: "FlatCharge", label: "Flat Charge" },
    { value: "VanPack", label: "Van Pack" },
] as const satisfies readonly ComboboxOption[];

export const feCategoryOptions = [
    { value: "GeneralTask", label: "General Task" },
    { value: "Mileage", label: "Mileage" },
    { value: "Transfer", label: "Transfer" },
    { value: "AdditionalCost", label: "Additional Cost" },
] as const satisfies readonly ComboboxOption[];

export const stdCategoryOptions = [
    { value: "Mileage", label: "Mileage" },
    { value: "FlatCharge", label: "Flat Charge" },
    { value: "VanPack", label: "Van Pack" },
] as const satisfies readonly ComboboxOption[];

export function getCategoryOptionsForFascia(
    fascia: RequisitionLimitRuleFascia | "",
): ComboboxOption[] {
    if (fascia === "Fe") {
        return [...feCategoryOptions];
    }

    if (fascia === "Std") {
        return [...stdCategoryOptions];
    }

    return [];
}

export function isAllowedCategoryForFascia(
    fascia: RequisitionLimitRuleFascia,
    category: RequisitionLimitRuleCategory,
) {
    return getCategoryOptionsForFascia(fascia).some(
        (option) => option.value === category,
    );
}
export { REQUISITION_FASCIAS as requisitionLimitRuleFascias, FASCIA_OPTIONS as fasciaOptions } from "@/lib/constants/fascias";