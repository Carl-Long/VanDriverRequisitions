import type { useFieldArray } from "react-hook-form";
import type {
    FeRequisitionDetail,
    SaveFeRequisition,
} from "@/lib/api/fe-requisitions";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import { cn } from "@/lib/utils";

export const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const;

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type Week = RequisitionFormData["feGeneralTasks"][number]["week"];

export const todayDate = () => new Date().toISOString().slice(0, 10);

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(value);
}

export const inputClass = (hasError: boolean) =>
    cn(
        "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors",
        hasError
            ? "border-red-500 focus:border-red-500"
            : "border-border focus:border-primary/30",
    );

export function weekTotal(w: Week): number {
    return (
        (Number(w.sunday) || 0) +
        (Number(w.monday) || 0) +
        (Number(w.tuesday) || 0) +
        (Number(w.wednesday) || 0) +
        (Number(w.thursday) || 0) +
        (Number(w.friday) || 0) +
        (Number(w.saturday) || 0)
    );
}

export function emptyWeek(): Week {
    return {
        sunday: null,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
    };
}

export function emptyGeneralTask(feTaskTypeId: string) {
    return {
        id: null,
        feTaskTypeId,
        weekEndingDate: todayDate(),
        week: emptyWeek(),
        ratePerJob: 0,
    };
}

export function emptyMileage() {
    return {
        id: null,
        weekEndingDate: todayDate(),
        week: emptyWeek(),
        ratePerMile: 0,
    };
}

export function emptyTransfer() {
    return {
        id: null,
        weekEndingDate: todayDate(),
        shopIdFrom: "",
        shopIdTo: "",
        week: emptyWeek(),
        ratePerJob: 0,
    };
}

export function emptyAdditionalCost() {
    return {
        id: null,
        weekEndingDate: todayDate(),
        reasonId: "",
        chargingOption: "Job" as const,
        totalNumber: null,
        ratePerJob: null,
        miles: null,
        ratePerMile: null,
    };
}

export function defaultsFromDetail(
    detail: FeRequisitionDetail | null,
): RequisitionFormData {
    if (!detail) {
        return {
            requisitionDate: todayDate(),
            vanDriverId: "",
            vanDriverName: "",
            shopId: "",
            isVatApplicable: false,
            poNumber: null,
            feGeneralTasks: [],
            feMileages: [],
            feTransfers: [],
            feAdditionalCosts: [],
        };
    }
    return {
        requisitionDate: detail.requisitionDate,
        vanDriverId: detail.vanDriverId,
        vanDriverName: detail.vanDriverName,
        shopId: detail.shopId,
        isVatApplicable: detail.isVatApplicable,
        poNumber: detail.poNumber,
        feGeneralTasks: detail.feGeneralTasks.map((t) => ({
            id: t.id,
            feTaskTypeId: t.feTaskTypeId,
            weekEndingDate: t.weekEndingDate,
            week: t.week,
            ratePerJob: t.ratePerJob ?? 0,
        })),
        feMileages: detail.feMileages.map((m) => ({
            id: m.id,
            weekEndingDate: m.weekEndingDate,
            week: m.week,
            ratePerMile: m.ratePerMile ?? 0,
        })),
        feTransfers: detail.feTransfers.map((t) => ({
            id: t.id,
            weekEndingDate: t.weekEndingDate,
            shopIdFrom: t.shopIdFrom,
            shopIdTo: t.shopIdTo,
            week: t.week,
            ratePerJob: t.ratePerJob ?? 0,
        })),
        feAdditionalCosts: detail.feAdditionalCosts.map((c) => ({
            id: c.id,
            weekEndingDate: c.weekEndingDate,
            reasonId: c.reasonId,
            chargingOption: c.chargingOption,
            totalNumber: c.totalNumber,
            ratePerJob: c.ratePerJob,
            miles: c.miles,
            ratePerMile: c.ratePerMile,
        })),
    };
}

export function countRowErrors(rows: unknown): number {
    if (!Array.isArray(rows)) return 0;
    return rows.reduce<number>((sum, row) => {
        if (!row) return sum;
        return sum + Object.keys(row).length;
    }, 0);
}

export function toPayload(data: RequisitionFormData): SaveFeRequisition {
    return {
        requisitionDate: data.requisitionDate,
        vanDriverId: data.vanDriverId,
        vanDriverName: data.vanDriverName,
        shopId: data.shopId,
        isVatApplicable: data.isVatApplicable,
        poNumber: data.poNumber ?? null,
        feGeneralTasks: data.feGeneralTasks.map((r) => ({
            id: r.id ?? null,
            feTaskTypeId: r.feTaskTypeId,
            weekEndingDate: r.weekEndingDate,
            week: r.week,
            ratePerJob: Number(r.ratePerJob),
        })),
        feMileages: data.feMileages.map((r) => ({
            id: r.id ?? null,
            weekEndingDate: r.weekEndingDate,
            week: r.week,
            ratePerMile: Number(r.ratePerMile),
        })),
        feTransfers: data.feTransfers.map((r) => ({
            id: r.id ?? null,
            weekEndingDate: r.weekEndingDate,
            shopIdFrom: r.shopIdFrom,
            shopIdTo: r.shopIdTo,
            week: r.week,
            ratePerJob: Number(r.ratePerJob),
        })),
        feAdditionalCosts: data.feAdditionalCosts.map((r) => ({
            id: r.id ?? null,
            weekEndingDate: r.weekEndingDate,
            reasonId: r.reasonId,
            chargingOption: r.chargingOption,
            totalNumber: r.chargingOption === "Job" ? r.totalNumber : null,
            ratePerJob: r.chargingOption === "Job" ? r.ratePerJob : null,
            miles: r.chargingOption === "Mileage" ? r.miles : null,
            ratePerMile: r.chargingOption === "Mileage" ? r.ratePerMile : null,
        })),
    };
}

export type FieldArrayReturn<
    T extends
    | "feGeneralTasks"
    | "feMileages"
    | "feTransfers"
    | "feAdditionalCosts",
> = ReturnType<typeof useFieldArray<RequisitionFormData, T>>;
