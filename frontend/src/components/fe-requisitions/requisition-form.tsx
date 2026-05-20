"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    FormProvider,
    useFieldArray,
    useForm,
    useWatch,
    type Control,
    type FieldErrors,
    type UseFormRegister,
    type UseFormSetValue,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    Plus,
    Send,
    Trash2,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";
import { cn } from "@/lib/utils";
import {
    requisitionFormSchema,
    type RequisitionFormData,
} from "@/lib/schemas/requisition";
import {
    feRequisitionsApi,
    type FeRequisitionDetail,
    type SaveFeRequisition,
} from "@/lib/api/fe-requisitions";
import { shopsApi, type ShopLookup } from "@/lib/api/shops";
import { vanDriversApi, type VanDriverLookup } from "@/lib/api/van-drivers";
import { feTaskTypesApi, type FeTaskType } from "@/lib/api/fe-task-types";
import { feReasonsApi, type FeReason } from "@/lib/api/fe-reasons";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const todayDate = () => new Date().toISOString().slice(0, 10);

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(value);
}

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const inputClass = (hasError: boolean) =>
    cn(
        "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors",
        hasError
            ? "border-red-500 focus:border-red-500"
            : "border-border focus:border-primary/30",
    );

function emptyWeek() {
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

function emptyGeneralTask(feTaskTypeId: string) {
    return {
        id: null,
        feTaskTypeId,
        weekEndingDate: todayDate(),
        week: emptyWeek(),
        ratePerJob: 0,
    };
}

function emptyMileage() {
    return {
        id: null,
        weekEndingDate: todayDate(),
        week: emptyWeek(),
        ratePerMile: 0,
    };
}

function emptyTransfer() {
    return {
        id: null,
        weekEndingDate: todayDate(),
        shopIdFrom: "",
        shopIdTo: "",
        week: emptyWeek(),
        ratePerJob: 0,
    };
}

function emptyAdditionalCost() {
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

function weekTotal(w: {
    sunday: number | null;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
}): number {
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

function defaultsFromDetail(detail: FeRequisitionDetail | null): RequisitionFormData {
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

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

type RequisitionFormProps = {
    initial: FeRequisitionDetail | null; // null = create mode
};


export function RequisitionForm({ initial }: Readonly<RequisitionFormProps>) {
    const router = useRouter();
    const toast = useToast();
    const isCreate = !initial;
    const isReadOnly = !!initial && !initial.isEditable;
    const { status: submitWindow } = useSubmitWindowStatus();

    // ─── Lookups ─────────────────────────────────────────────────────────────
    const [taskTypes, setTaskTypes] = useState<FeTaskType[]>([]);
    const [reasons, setReasons] = useState<FeReason[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<VanDriverLookup | null>(null);
    const [selectedShop, setSelectedShop] = useState<ShopLookup | null>(null);
    const [transferShopCache, setTransferShopCache] = useState<Record<string, ShopLookup>>({});

    useEffect(() => {
        feTaskTypesApi.getAll().then((items) => {
            setTaskTypes(items.filter((x) => x.isActive));
        }).catch(() => toast.error("Failed to load task types."));
        feReasonsApi.getAll().then((items) => {
            setReasons(items.filter((x) => x.isActive));
        }).catch(() => toast.error("Failed to load reasons."));
    }, [toast]);

    // Load initial driver/shop labels if editing
    useEffect(() => {
        if (initial?.vanDriverId) {
            vanDriversApi.getById(initial.vanDriverId).then(setSelectedDriver).catch(() => { });
        }
        if (initial) {
            setSelectedShop({ id: initial.shopId, code: initial.shopCode, name: initial.shopName });
            // Pre-populate transfer shop cache from initial
            const cache: Record<string, ShopLookup> = {};
            for (const t of initial.feTransfers) {
                cache[t.shopIdFrom] = { id: t.shopIdFrom, code: t.shopCodeFrom, name: t.shopNameFrom };
                cache[t.shopIdTo] = { id: t.shopIdTo, code: t.shopCodeTo, name: t.shopNameTo };
            }
            setTransferShopCache(cache);
        }
    }, [initial]);

    // ─── Form ────────────────────────────────────────────────────────────────
    const methods = useForm<RequisitionFormData>({
        resolver: zodResolver(requisitionFormSchema),
        defaultValues: defaultsFromDetail(initial),
        mode: "onChange",
    });
    const {
        register,
        control,
        handleSubmit,
        setValue,
        setError,
        reset,
        getValues,
        formState: { errors, isSubmitting },
    } = methods;

    const generalTasksArr = useFieldArray({ control, name: "feGeneralTasks" });
    const mileagesArr = useFieldArray({ control, name: "feMileages" });
    const transfersArr = useFieldArray({ control, name: "feTransfers" });
    const additionalCostsArr = useFieldArray({ control, name: "feAdditionalCosts" });

    // Watch all child collections for live subtotal computation
    const watchedTasks = useWatch({ control, name: "feGeneralTasks" });
    const watchedMileages = useWatch({ control, name: "feMileages" });
    const watchedTransfers = useWatch({ control, name: "feTransfers" });
    const watchedCosts = useWatch({ control, name: "feAdditionalCosts" });

    const subtotal = useMemo(() => {
        const tasksTotal = (watchedTasks ?? []).reduce(
            (sum, r) => sum + weekTotal(r.week) * (Number(r.ratePerJob) || 0),
            0,
        );
        const mileageTotal = (watchedMileages ?? []).reduce(
            (sum, r) => sum + weekTotal(r.week) * (Number(r.ratePerMile) || 0),
            0,
        );
        const transfersTotal = (watchedTransfers ?? []).reduce(
            (sum, r) => sum + weekTotal(r.week) * (Number(r.ratePerJob) || 0),
            0,
        );
        const costsTotal = (watchedCosts ?? []).reduce((sum, r) => {
            if (r.chargingOption === "Mileage") {
                return sum + (Number(r.miles) || 0) * (Number(r.ratePerMile) || 0);
            }
            return sum + (Number(r.totalNumber) || 0) * (Number(r.ratePerJob) || 0);
        }, 0);
        return tasksTotal + mileageTotal + transfersTotal + costsTotal;
    }, [watchedTasks, watchedMileages, watchedTransfers, watchedCosts]);

    // ─── Tabs ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<string>("home");

    type TabSpec = {
        key: string;
        label: string;
        errorCount: number;
    };

    const tabs: TabSpec[] = useMemo(() => {
        const list: TabSpec[] = [
            {
                key: "home",
                label: "Home",
                errorCount:
                    (errors.requisitionDate ? 1 : 0) +
                    (errors.vanDriverId ? 1 : 0) +
                    (errors.vanDriverName ? 1 : 0) +
                    (errors.shopId ? 1 : 0),
            },
        ];

        for (const tt of taskTypes) {
            const count = (errors.feGeneralTasks ?? []).reduce<number>((sum, rowErr, i) => {
                if (!rowErr) return sum;
                const row = watchedTasks?.[i];
                if (row?.feTaskTypeId !== tt.id) return sum;
                return sum + Object.keys(rowErr).length;
            }, 0);
            list.push({ key: `tt-${tt.id}`, label: tt.name, errorCount: count });
        }

        list.push(
            {
                key: "mileage",
                label: "Mileage",
                errorCount: countRowErrors(errors.feMileages),
            },
            {
                key: "transfers",
                label: "Transfers",
                errorCount: countRowErrors(errors.feTransfers),
            },
            {
                key: "additionalCosts",
                label: "Additional Costs",
                errorCount: countRowErrors(errors.feAdditionalCosts),
            },
        );
        return list;
    }, [errors, taskTypes, watchedTasks]);

    const totalErrors = tabs.reduce((sum, t) => sum + t.errorCount, 0);
    const canSave = totalErrors === 0 && subtotal > 0 && !isReadOnly;
    const canSubmit =
        canSave && !isCreate && !!submitWindow?.currentWindow && initial?.isEditable;

    // ─── Submit/Save logic ──────────────────────────────────────────────────
    const [submitOpen, setSubmitOpen] = useState(false);

    function mapServerErrors(apiErr: {
        detail?: string;
        errors?: Record<string, string[]>;
    }) {
        if (apiErr.errors) {
            for (const [key, msgs] of Object.entries(apiErr.errors)) {
                const lower = key.toLowerCase();
                if (lower === "vandriverid")
                    setError("vanDriverId", { message: msgs[0] });
                else if (lower === "vandrivername")
                    setError("vanDriverName", { message: msgs[0] });
                else if (lower === "shopid") setError("shopId", { message: msgs[0] });
                else if (lower === "requisitiondate")
                    setError("requisitionDate", { message: msgs[0] });
            }
            toast.error(apiErr.detail ?? "Please fix the highlighted fields.");
        } else {
            toast.error(apiErr.detail ?? "Something went wrong. Please try again.");
        }
    }

    function toPayload(data: RequisitionFormData): SaveFeRequisition {
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

    const doSave = useCallback(
        (then: "stay" | "close"): Promise<FeRequisitionDetail | null> => {
            return new Promise((resolve) => {
                handleSubmit(
                    async (data) => {
                        try {
                            const payload = toPayload(data);
                            const result = isCreate
                                ? await feRequisitionsApi.create(payload)
                                : await feRequisitionsApi.update(initial!.id, payload);

                            toast.success(
                                isCreate
                                    ? `Requisition ${result.requisitionNumber} created.`
                                    : `Requisition ${result.requisitionNumber} saved.`,
                            );

                            if (then === "close") {
                                router.push("/home-van-drivers");
                            } else if (isCreate) {
                                router.replace(`/home-van-drivers/${result.id}`);
                            } else {
                                reset(defaultsFromDetail(result));
                            }
                            resolve(result);
                        } catch (err) {
                            mapServerErrors(
                                err as { detail?: string; errors?: Record<string, string[]> },
                            );
                            resolve(null);
                        }
                    },
                    () => {
                        toast.error("Please fix the highlighted fields before saving.");
                        resolve(null);
                    },
                )();
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handleSubmit, isCreate, initial, router, reset],
    );

    async function doSubmit() {
        if (!initial) return;
        try {
            // Save first to capture any pending changes
            const saved = await doSave("stay");
            if (!saved) return;
            const result = await feRequisitionsApi.submit(saved.id);
            toast.success(`Requisition ${result.requisitionNumber} submitted.`);
            setSubmitOpen(false);
            router.push("/home-van-drivers");
        } catch (err) {
            mapServerErrors(
                err as { detail?: string; errors?: Record<string, string[]> },
            );
            setSubmitOpen(false);
        }
    }

    // ─── Combobox fetchers ───────────────────────────────────────────────────
    const fetchDrivers = useCallback(async (search: string) => {
        const res = await vanDriversApi.search({ search, pageSize: 30 });
        return res.items.map((d) => ({
            value: d.id,
            label: `${d.code} — ${d.tradersName}`,
            description: [d.town, d.postcode].filter(Boolean).join(", "),
            data: d,
        }));
    }, []);

    const fetchShops = useCallback(async (search: string) => {
        const res = await shopsApi.search({ search, pageSize: 30 });
        return res.items.map((s) => ({
            value: s.id,
            label: `${s.code} — ${s.name}`,
            description: undefined,
            data: s,
        }));
    }, []);

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <FormProvider {...methods}>
            <div className="space-y-4">
                {/* Header bar */}
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Requisition #</p>
                            <p className="font-mono font-medium text-foreground">
                                {initial?.requisitionNumber ?? "new requisition"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="font-medium text-foreground">
                                {initial?.status ?? "Draft"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                            <p className="font-medium text-foreground tabular-nums">
                                {formatCurrency(subtotal)}
                            </p>
                        </div>
                        {totalErrors > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600">
                                <AlertCircle size={14} />
                                {totalErrors} validation issue{totalErrors === 1 ? "" : "s"}
                            </div>
                        )}
                    </div>

                    {!isReadOnly && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => doSave("stay")}
                                disabled={!canSave || isSubmitting}
                            >
                                Save &amp; Continue
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => doSave("close")}
                                disabled={!canSave || isSubmitting}
                            >
                                Save &amp; Close
                            </Button>
                            {!isCreate && (
                                <Button
                                    onClick={() => setSubmitOpen(true)}
                                    disabled={!canSubmit || isSubmitting}
                                >
                                    <Send size={14} />
                                    Submit
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {isReadOnly && (
                    <div className="rounded-lg bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                        This requisition is <strong>{initial?.status}</strong> and cannot be edited.
                    </div>
                )}

                {initial?.status === "Rejected" && initial.rejectionNotes && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                        <p className="mb-1 font-semibold">Rejection Notes</p>
                        <p>{initial.rejectionNotes}</p>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto border-b border-border">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setActiveTab(t.key)}
                            className={cn(
                                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition",
                                activeTab === t.key
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {t.label}
                            {t.errorCount > 0 && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-xs font-semibold text-red-600">
                                    {t.errorCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <fieldset disabled={isReadOnly || isSubmitting} className="space-y-4">
                    {activeTab === "home" && (
                        <HomeTab
                            register={register}
                            errors={errors}
                            control={control}
                            setValue={setValue}
                            selectedDriver={selectedDriver}
                            setSelectedDriver={setSelectedDriver}
                            selectedShop={selectedShop}
                            setSelectedShop={setSelectedShop}
                            fetchDrivers={fetchDrivers}
                            fetchShops={fetchShops}
                        />
                    )}

                    {taskTypes.map((tt) => {
                        if (activeTab !== `tt-${tt.id}`) return null;
                        return (
                            <GeneralTasksTab
                                key={tt.id}
                                taskType={tt}
                                arr={generalTasksArr}
                                register={register}
                                errors={errors}
                                getValues={getValues}
                                setValue={setValue}
                            />
                        );
                    })}

                    {activeTab === "mileage" && (
                        <MileageTab
                            arr={mileagesArr}
                            register={register}
                            errors={errors}
                        />
                    )}

                    {activeTab === "transfers" && (
                        <TransfersTab
                            arr={transfersArr}
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            shopCache={transferShopCache}
                            setShopCache={setTransferShopCache}
                            fetchShops={fetchShops}
                        />
                    )}

                    {activeTab === "additionalCosts" && (
                        <AdditionalCostsTab
                            arr={additionalCostsArr}
                            register={register}
                            errors={errors}
                            reasons={reasons}
                            control={control}
                        />
                    )}
                </fieldset>

                <Modal
                    open={submitOpen}
                    onClose={() => setSubmitOpen(false)}
                    title="Submit Requisition"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-foreground">
                            Once submitted, this requisition will no longer be editable. Are you
                            sure you want to submit{" "}
                            <strong>{initial?.requisitionNumber}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setSubmitOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={doSubmit} disabled={isSubmitting}>
                                <Send size={14} />
                                Submit
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </FormProvider>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function countRowErrors(rows: unknown): number {
    if (!Array.isArray(rows)) return 0;
    return rows.reduce<number>((sum, row) => {
        if (!row) return sum;
        return sum + Object.keys(row).length;
    }, 0);
}

// ────────────────────────────────────────────────────────────────────────────
// Home Tab
// ────────────────────────────────────────────────────────────────────────────

type HomeTabProps = {
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    control: Control<RequisitionFormData>;
    setValue: UseFormSetValue<RequisitionFormData>;
    selectedDriver: VanDriverLookup | null;
    setSelectedDriver: (d: VanDriverLookup | null) => void;
    selectedShop: ShopLookup | null;
    setSelectedShop: (s: ShopLookup | null) => void;
    fetchDrivers: (search: string) => Promise<ComboboxOption<VanDriverLookup>[]>;
    fetchShops: (search: string) => Promise<ComboboxOption<ShopLookup>[]>;
};

function HomeTab({
    register,
    errors,
    control,
    setValue,
    selectedDriver,
    setSelectedDriver,
    selectedShop,
    setSelectedShop,
    fetchDrivers,
    fetchShops,
}: Readonly<HomeTabProps>) {
    const vanDriverId = useWatch({ control, name: "vanDriverId" });
    const shopId = useWatch({ control, name: "shopId" });

    function handleDriverChange(value: string | null, data: VanDriverLookup | null) {
        setValue("vanDriverId", value ?? "", { shouldValidate: true });
        setSelectedDriver(data);
    }

    function handleShopChange(value: string | null, data: ShopLookup | null) {
        setValue("shopId", value ?? "", { shouldValidate: true });
        setSelectedShop(data);
    }

    return (
        <div className="space-y-5 rounded-xl border border-border bg-surface p-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label
                        htmlFor="requisitionDate"
                        className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground"
                    >
                        <CalendarDays size={14} /> Submission Date
                    </label>
                    <input
                        id="requisitionDate"
                        type="date"
                        {...register("requisitionDate")}
                        className={inputClass(!!errors.requisitionDate)}
                    />
                    {errors.requisitionDate && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.requisitionDate.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
                        <User size={14} /> Van Driver Code (81 Code)
                    </label>
                    <Combobox<VanDriverLookup>
                        value={vanDriverId || null}
                        selectedLabel={
                            selectedDriver
                                ? `${selectedDriver.code} — ${selectedDriver.tradersName}`
                                : null
                        }
                        placeholder="Search by code or trader name…"
                        invalid={!!errors.vanDriverId}
                        onChange={handleDriverChange}
                        fetchOptions={fetchDrivers}
                        renderOption={(opt) => (
                            <div>
                                <p className="truncate text-foreground">
                                    <span className="font-mono font-medium">{opt.data.code}</span>{" "}
                                    — {opt.data.tradersName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {[opt.data.town, opt.data.postcode].filter(Boolean).join(", ")}
                                </p>
                            </div>
                        )}
                    />
                    {errors.vanDriverId && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.vanDriverId.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="vanDriverName"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Driver Name
                    </label>
                    <input
                        id="vanDriverName"
                        type="text"
                        {...register("vanDriverName")}
                        className={inputClass(!!errors.vanDriverName)}
                    />
                    {errors.vanDriverName && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.vanDriverName.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
                        <Building2 size={14} /> Shop (Tcode)
                    </label>
                    <Combobox<ShopLookup>
                        value={shopId || null}
                        selectedLabel={
                            selectedShop
                                ? `${selectedShop.code} — ${selectedShop.name}`
                                : null
                        }
                        placeholder="Search by code or name…"
                        invalid={!!errors.shopId}
                        onChange={handleShopChange}
                        fetchOptions={fetchShops}
                    />
                    {errors.shopId && (
                        <p className="mt-1 text-xs text-red-500">{errors.shopId.message}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="poNumber"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        PO Number (optional)
                    </label>
                    <input
                        id="poNumber"
                        type="text"
                        {...register("poNumber")}
                        className={inputClass(false)}
                    />
                </div>

                <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <input
                            type="checkbox"
                            {...register("isVatApplicable")}
                            className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <span>VAT Applicable</span>
                    </label>
                </div>
            </div>

            {selectedDriver && (
                <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 text-sm">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Van Driver Details
                    </p>
                    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        <div>
                            <dt className="text-xs text-muted-foreground">Traders Name</dt>
                            <dd className="text-foreground">{selectedDriver.tradersName}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Address</dt>
                            <dd className="text-foreground">
                                {[
                                    selectedDriver.address1,
                                    selectedDriver.address2,
                                    selectedDriver.town,
                                    selectedDriver.postcode,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">Phone</dt>
                            <dd className="text-foreground">{selectedDriver.phone || "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-muted-foreground">VAT</dt>
                            <dd>
                                {selectedDriver.hasVat ? (
                                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                        VAT Registered{" "}
                                        {selectedDriver.vatNumber
                                            ? `(${selectedDriver.vatNumber})`
                                            : ""}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                        No VAT
                                    </span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Reusable: Week (Sun-Sat) inputs
// ────────────────────────────────────────────────────────────────────────────

function WeekFields({
    register,
    pathPrefix,
    errorMessage,
}: Readonly<{
    register: UseFormRegister<RequisitionFormData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pathPrefix: any;
    errorMessage?: string;
}>) {
    return (
        <div>
            <div className="grid grid-cols-7 gap-1.5">
                {DAYS.map((d, i) => (
                    <div key={d}>
                        <label className="mb-0.5 block text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {DAY_LABELS[i]}
                        </label>
                        <input
                            type="number"
                            min={0}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            {...register(`${pathPrefix}.week.${d}` as any, {
                                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                            })}
                            className="w-full rounded border border-border bg-surface px-1.5 py-1 text-center text-sm tabular-nums focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-ring/20"
                            placeholder="0"
                        />
                    </div>
                ))}
            </div>
            {errorMessage && (
                <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// General Tasks Tab (one instance per task type)
// ────────────────────────────────────────────────────────────────────────────

type FieldArrayReturn<T extends "feGeneralTasks" | "feMileages" | "feTransfers" | "feAdditionalCosts"> =
    ReturnType<typeof useFieldArray<RequisitionFormData, T>>;

function GeneralTasksTab({
    taskType,
    arr,
    register,
    errors,
    getValues,
    setValue,
}: Readonly<{
    taskType: FeTaskType;
    arr: FieldArrayReturn<"feGeneralTasks">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    getValues: () => RequisitionFormData;
    setValue: UseFormSetValue<RequisitionFormData>;
}>) {
    // Filter indexes belonging to this task type
    const allFields = arr.fields;
    const indexes = allFields
        .map((f, i) => ({ f, i }))
        .filter(({ f }) => f.feTaskTypeId === taskType.id)
        .map(({ i }) => i);

    function handleAdd() {
        arr.append(emptyGeneralTask(taskType.id));
    }

    function handleRemove(index: number) {
        arr.remove(index);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                    {taskType.name} ({taskType.code})
                </h3>
                <Button variant="secondary" size="sm" onClick={handleAdd}>
                    <Plus size={14} />
                    Add Row
                </Button>
            </div>

            {indexes.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No rows yet. Click <strong>Add Row</strong> to record {taskType.name}.
                </p>
            )}

            {indexes.map((index) => {
                const rowErrors = errors.feGeneralTasks?.[index];
                return (
                    <div
                        key={allFields[index].id}
                        className="grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[160px_1fr_120px_120px_40px] md:items-end"
                    >
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Week Ending
                            </span>
                            <input
                                type="date"
                                {...register(`feGeneralTasks.${index}.weekEndingDate`)}
                                className={inputClass(!!rowErrors?.weekEndingDate)}
                            />
                        </div>
                        <WeekFields
                            register={register}
                            pathPrefix={`feGeneralTasks.${index}`}
                            errorMessage={rowErrors?.week?.message ?? rowErrors?.week?.root?.message}
                        />
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate / Job
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(`feGeneralTasks.${index}.ratePerJob`, {
                                    valueAsNumber: true,
                                })}
                                className={inputClass(!!rowErrors?.ratePerJob)}
                            />
                            {rowErrors?.ratePerJob && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.ratePerJob.message}
                                </p>
                            )}
                        </div>
                        <RowTotal pathPrefix={`feGeneralTasks.${index}`} rateKey="ratePerJob" />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                            aria-label="Delete row"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Mileage Tab
// ────────────────────────────────────────────────────────────────────────────

function MileageTab({
    arr,
    register,
    errors,
}: Readonly<{
    arr: FieldArrayReturn<"feMileages">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
}>) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Mileage</h3>
                <Button variant="secondary" size="sm" onClick={() => arr.append(emptyMileage())}>
                    <Plus size={14} /> Add Row
                </Button>
            </div>

            {arr.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No mileage rows yet.
                </p>
            )}

            {arr.fields.map((f, index) => {
                const rowErrors = errors.feMileages?.[index];
                return (
                    <div
                        key={f.id}
                        className="grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[160px_1fr_120px_120px_40px] md:items-end"
                    >
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Week Ending
                            </span>
                            <input
                                type="date"
                                {...register(`feMileages.${index}.weekEndingDate`)}
                                className={inputClass(!!rowErrors?.weekEndingDate)}
                            />
                        </div>
                        <WeekFields
                            register={register}
                            pathPrefix={`feMileages.${index}`}
                            errorMessage={rowErrors?.week?.message ?? rowErrors?.week?.root?.message}
                        />
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate / Mile
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(`feMileages.${index}.ratePerMile`, {
                                    valueAsNumber: true,
                                })}
                                className={inputClass(!!rowErrors?.ratePerMile)}
                            />
                            {rowErrors?.ratePerMile && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.ratePerMile.message}
                                </p>
                            )}
                        </div>
                        <RowTotal pathPrefix={`feMileages.${index}`} rateKey="ratePerMile" />
                        <button
                            type="button"
                            onClick={() => arr.remove(index)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                            aria-label="Delete row"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Transfers Tab
// ────────────────────────────────────────────────────────────────────────────

function TransfersTab({
    arr,
    register,
    errors,
    setValue,
    getValues,
    shopCache,
    setShopCache,
    fetchShops,
}: Readonly<{
    arr: FieldArrayReturn<"feTransfers">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    setValue: UseFormSetValue<RequisitionFormData>;
    getValues: () => RequisitionFormData;
    shopCache: Record<string, ShopLookup>;
    setShopCache: (next: Record<string, ShopLookup>) => void;
    fetchShops: (search: string) => Promise<ComboboxOption<ShopLookup>[]>;
}>) {
    function setShop(index: number, side: "From" | "To", value: string | null, data: ShopLookup | null) {
        const field = side === "From" ? "shopIdFrom" : "shopIdTo";
        setValue(`feTransfers.${index}.${field}`, value ?? "", { shouldValidate: true });
        if (data) setShopCache({ ...shopCache, [data.id]: data });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Transfers</h3>
                <Button variant="secondary" size="sm" onClick={() => arr.append(emptyTransfer())}>
                    <Plus size={14} /> Add Row
                </Button>
            </div>

            {arr.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No transfer rows yet.
                </p>
            )}

            {arr.fields.map((f, index) => {
                const rowErrors = errors.feTransfers?.[index];
                const values = getValues().feTransfers[index];
                const fromShop = values?.shopIdFrom ? shopCache[values.shopIdFrom] : null;
                const toShop = values?.shopIdTo ? shopCache[values.shopIdTo] : null;
                return (
                    <div
                        key={f.id}
                        className="grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[140px_1fr_1fr_1fr_120px_120px_40px] md:items-end"
                    >
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Week Ending
                            </span>
                            <input
                                type="date"
                                {...register(`feTransfers.${index}.weekEndingDate`)}
                                className={inputClass(!!rowErrors?.weekEndingDate)}
                            />
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                From Shop
                            </span>
                            <Combobox<ShopLookup>
                                value={values?.shopIdFrom || null}
                                selectedLabel={fromShop ? `${fromShop.code} — ${fromShop.name}` : null}
                                invalid={!!rowErrors?.shopIdFrom}
                                onChange={(v, d) => setShop(index, "From", v, d)}
                                fetchOptions={fetchShops}
                            />
                            {rowErrors?.shopIdFrom && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.shopIdFrom.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                To Shop
                            </span>
                            <Combobox<ShopLookup>
                                value={values?.shopIdTo || null}
                                selectedLabel={toShop ? `${toShop.code} — ${toShop.name}` : null}
                                invalid={!!rowErrors?.shopIdTo}
                                onChange={(v, d) => setShop(index, "To", v, d)}
                                fetchOptions={fetchShops}
                            />
                            {rowErrors?.shopIdTo && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.shopIdTo.message}
                                </p>
                            )}
                        </div>
                        <WeekFields
                            register={register}
                            pathPrefix={`feTransfers.${index}`}
                            errorMessage={rowErrors?.week?.message ?? rowErrors?.week?.root?.message}
                        />
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate / Job
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(`feTransfers.${index}.ratePerJob`, {
                                    valueAsNumber: true,
                                })}
                                className={inputClass(!!rowErrors?.ratePerJob)}
                            />
                        </div>
                        <RowTotal pathPrefix={`feTransfers.${index}`} rateKey="ratePerJob" />
                        <button
                            type="button"
                            onClick={() => arr.remove(index)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                            aria-label="Delete row"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Additional Costs Tab
// ────────────────────────────────────────────────────────────────────────────

function AdditionalCostsTab({
    arr,
    register,
    errors,
    reasons,
    control,
}: Readonly<{
    arr: FieldArrayReturn<"feAdditionalCosts">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    reasons: FeReason[];
    control: Control<RequisitionFormData>;
}>) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Additional Costs</h3>
                <Button variant="secondary" size="sm" onClick={() => arr.append(emptyAdditionalCost())}>
                    <Plus size={14} /> Add Row
                </Button>
            </div>

            {arr.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No additional cost rows yet.
                </p>
            )}

            {arr.fields.map((f, index) => (
                <AdditionalCostRow
                    key={f.id}
                    index={index}
                    register={register}
                    errors={errors}
                    reasons={reasons}
                    control={control}
                    onRemove={() => arr.remove(index)}
                />
            ))}
        </div>
    );
}

function AdditionalCostRow({
    index,
    register,
    errors,
    reasons,
    control,
    onRemove,
}: Readonly<{
    index: number;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    reasons: FeReason[];
    control: Control<RequisitionFormData>;
    onRemove: () => void;
}>) {
    const row = useWatch({ control, name: `feAdditionalCosts.${index}` });
    const rowErrors = errors.feAdditionalCosts?.[index];
    const isJob = row?.chargingOption === "Job";
    const computed = isJob
        ? (Number(row?.totalNumber) || 0) * (Number(row?.ratePerJob) || 0)
        : (Number(row?.miles) || 0) * (Number(row?.ratePerMile) || 0);

    return (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
            <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr_40px] md:items-end">
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Week Ending
                    </span>
                    <input
                        type="date"
                        {...register(`feAdditionalCosts.${index}.weekEndingDate`)}
                        className={inputClass(!!rowErrors?.weekEndingDate)}
                    />
                </div>
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Reason
                    </span>
                    <select
                        {...register(`feAdditionalCosts.${index}.reasonId`)}
                        className={inputClass(!!rowErrors?.reasonId)}
                    >
                        <option value="">Select a reason…</option>
                        {reasons.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.reason}
                            </option>
                        ))}
                    </select>
                    {rowErrors?.reasonId && (
                        <p className="mt-1 text-xs text-red-500">{rowErrors.reasonId.message}</p>
                    )}
                </div>
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Charging Option
                    </span>
                    <select
                        {...register(`feAdditionalCosts.${index}.chargingOption`)}
                        className={inputClass(false)}
                    >
                        <option value="Job">Job (Quantity × Rate)</option>
                        <option value="Mileage">Mileage (Miles × Rate)</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                    aria-label="Delete row"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
                {isJob ? (
                    <>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Quantity
                            </span>
                            <input
                                type="number"
                                min={0}
                                {...register(`feAdditionalCosts.${index}.totalNumber`, {
                                    setValueAs: (v) =>
                                        v === "" || v == null ? null : Number(v),
                                })}
                                className={inputClass(!!rowErrors?.totalNumber)}
                            />
                            {rowErrors?.totalNumber && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.totalNumber.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate per Job
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(`feAdditionalCosts.${index}.ratePerJob`, {
                                    setValueAs: (v) =>
                                        v === "" || v == null ? null : Number(v),
                                })}
                                className={inputClass(!!rowErrors?.ratePerJob)}
                            />
                            {rowErrors?.ratePerJob && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.ratePerJob.message}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Miles
                            </span>
                            <input
                                type="number"
                                min={0}
                                {...register(`feAdditionalCosts.${index}.miles`, {
                                    setValueAs: (v) =>
                                        v === "" || v == null ? null : Number(v),
                                })}
                                className={inputClass(!!rowErrors?.miles)}
                            />
                            {rowErrors?.miles && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.miles.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate per Mile
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(`feAdditionalCosts.${index}.ratePerMile`, {
                                    setValueAs: (v) =>
                                        v === "" || v == null ? null : Number(v),
                                })}
                                className={inputClass(!!rowErrors?.ratePerMile)}
                            />
                            {rowErrors?.ratePerMile && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.ratePerMile.message}
                                </p>
                            )}
                        </div>
                    </>
                )}
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Total
                    </span>
                    <p className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(computed)}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// Row total (live) for week-based rows
// ────────────────────────────────────────────────────────────────────────────

function RowTotal({
    pathPrefix,
    rateKey,
}: Readonly<{ pathPrefix: string; rateKey: "ratePerJob" | "ratePerMile" }>) {
    // Use form state via DOM — simpler approach: read using getValues isn't reactive,
    // so we just rely on parent re-renders when watched fields change.
    // For simplicity, we display computed value via window event or DOM lookup is overkill.
    // Instead, we compute via uncontrolled lookup using a hidden span updated via a tiny custom hook below.
    return (
        <RowTotalInner pathPrefix={pathPrefix} rateKey={rateKey} />
    );
}

function RowTotalInner({
    pathPrefix,
    rateKey,
}: Readonly<{ pathPrefix: string; rateKey: "ratePerJob" | "ratePerMile" }>) {
    // We re-use the form context via formState — easiest: subscribe via useWatch by passing absolute name
    // Note: pathPrefix is like `feGeneralTasks.0`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const week = useWatch({ name: `${pathPrefix}.week` as any });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rate = useWatch({ name: `${pathPrefix}.${rateKey}` as any });
    const total =
        week && typeof week === "object"
            ? weekTotal(week as Parameters<typeof weekTotal>[0]) * (Number(rate) || 0)
            : 0;
    return (
        <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Total
            </span>
            <p className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm font-medium tabular-nums text-foreground">
                {formatCurrency(total)}
            </p>
        </div>
    );
}
