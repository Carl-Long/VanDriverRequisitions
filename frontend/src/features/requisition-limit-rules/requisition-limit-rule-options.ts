import type {
    RequisitionLimitRuleCategory,
} from "./requisition-limit-rules-api";

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
] as const satisfies ReadonlyArray<{
    value: RequisitionLimitRuleCategory;
    label: string;
}>;

export {REQUISITION_FASCIAS as requisitionLimitRuleFascias, FASCIA_OPTIONS as fasciaOptions} from "@/lib/constants/fascias";