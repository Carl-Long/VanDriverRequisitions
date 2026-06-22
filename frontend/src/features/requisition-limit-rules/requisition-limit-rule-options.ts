import type {
    RequisitionLimitRuleCategory,
    RequisitionLimitRuleFascia,
} from "./requisition-limit-rules-api";

export const requisitionLimitRuleCategories = [
    "GeneralTask",
    "Mileage",
    "Transfer",
    "AdditionalCost",
    "FlatCharge",
    "VanPack",
] as const satisfies readonly RequisitionLimitRuleCategory[];

export const requisitionLimitRuleFascias = [
    "Fe",
    "Std",
] as const satisfies readonly RequisitionLimitRuleFascia[];

export const categoryOptions = [
    { value: "GeneralTask", label: "General Task" },
    { value: "Mileage", label: "Mileage" },
    { value: "Transfer", label: "Transfer" },
    { value: "AdditionalCost", label: "Additional Cost" },
    { value: "FlatCharge", label: "Flat Charge" },
    { value: "VanPack", label: "Van Pack" },
] as const satisfies ReadonlyArray<{
    value: RequisitionLimitRuleCategory;
    label: string;
}>;

export const fasciaOptions = [
    { value: "Fe", label: "FE" },
    { value: "Std", label: "STD" },
] as const satisfies ReadonlyArray<{
    value: RequisitionLimitRuleFascia;
    label: string;
}>;