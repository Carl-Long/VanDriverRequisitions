"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/lib/api/fe-requisitions";
import { shopsApi, type ShopLookup } from "@/lib/api/shops";
import { vanDriversApi, type VanDriverLookup } from "@/lib/api/van-drivers";
import { feTaskTypesApi, type FeTaskType } from "@/lib/api/fe-task-types";
import { feReasonsApi, type FeReason } from "@/lib/api/fe-reasons";
import {
    limitValuesApi,
    type LimitValue,
    WELL_KNOWN_LIMITS,
    buildLimitLookup,
} from "@/lib/api/limit-values";

import { HomeTab } from "./home-tab";
import { GeneralTasksTab } from "./general-tasks-tab";
import { MileageTab } from "./mileage-tab";
import { TransfersTab } from "./transfers-tab";
import { AdditionalCostsTab } from "./additional-costs-tab";
import {
    countRowErrors,
    defaultsFromDetail,
    formatCurrency,
    toPayload,
    weekTotal,
} from "./utils";

type RequisitionFormProps = {
    initial: FeRequisitionDetail | null;
};

type TabSpec = {
    key: string;
    label: string;
    errorCount: number;
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
    const [limitLookup, setLimitLookup] = useState<Record<string, LimitValue>>({});
    const [selectedDriver, setSelectedDriver] = useState<VanDriverLookup | null>(
        null,
    );
    const [selectedShop, setSelectedShop] = useState<ShopLookup | null>(null);
    const [transferShopCache, setTransferShopCache] = useState<
        Record<string, ShopLookup>
    >({});

    useEffect(() => {
        feTaskTypesApi
            .getAll()
            .then((items) => setTaskTypes(items.filter((x) => x.isActive)))
            .catch(() => toast.error("Failed to load task types."));
        feReasonsApi
            .getAll()
            .then((items) => setReasons(items.filter((x) => x.isActive)))
            .catch(() => toast.error("Failed to load reasons."));
        limitValuesApi
            .getAll(false)
            .then((items) => setLimitLookup(buildLimitLookup(items)))
            .catch(() => {
                /* limits are optional — degrade silently */
            });
    }, [toast]);

    useEffect(() => {
        if (initial?.vanDriverId) {
            vanDriversApi
                .getById(initial.vanDriverId)
                .then(setSelectedDriver)
                .catch(() => { });
        }
        if (initial) {
            setSelectedShop({
                id: initial.shopId,
                code: initial.shopCode,
                name: initial.shopName,
            });
            const cache: Record<string, ShopLookup> = {};
            for (const t of initial.feTransfers) {
                cache[t.shopIdFrom] = {
                    id: t.shopIdFrom,
                    code: t.shopCodeFrom,
                    name: t.shopNameFrom,
                };
                cache[t.shopIdTo] = {
                    id: t.shopIdTo,
                    code: t.shopCodeTo,
                    name: t.shopNameTo,
                };
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
    const additionalCostsArr = useFieldArray({
        control,
        name: "feAdditionalCosts",
    });

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
            const count = (errors.feGeneralTasks ?? []).reduce<number>(
                (sum, rowErr, i) => {
                    if (!rowErr) return sum;
                    const row = watchedTasks?.[i];
                    if (row?.feTaskTypeId !== tt.id) return sum;
                    return sum + Object.keys(rowErr).length;
                },
                0,
            );
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

    // ─── Save/Submit ─────────────────────────────────────────────────────────
    const [submitOpen, setSubmitOpen] = useState(false);

    const mapServerErrors = useCallback(
        (apiErr: { detail?: string; errors?: Record<string, string[]> }) => {
            if (apiErr.errors) {
                for (const [key, msgs] of Object.entries(apiErr.errors)) {
                    const lower = key.toLowerCase();
                    if (lower === "vandriverid")
                        setError("vanDriverId", { message: msgs[0] });
                    else if (lower === "vandrivername")
                        setError("vanDriverName", { message: msgs[0] });
                    else if (lower === "shopid")
                        setError("shopId", { message: msgs[0] });
                    else if (lower === "requisitiondate")
                        setError("requisitionDate", { message: msgs[0] });
                }
                toast.error(apiErr.detail ?? "Please fix the highlighted fields.");
            } else {
                toast.error(apiErr.detail ?? "Something went wrong. Please try again.");
            }
        },
        [setError, toast],
    );

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
                                err as {
                                    detail?: string;
                                    errors?: Record<string, string[]>;
                                },
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
        [handleSubmit, isCreate, initial, router, reset, toast, mapServerErrors],
    );

    async function doSubmit() {
        if (!initial) return;
        try {
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
                <FormHeader
                    initial={initial}
                    subtotal={subtotal}
                    totalErrors={totalErrors}
                    isReadOnly={isReadOnly}
                    isCreate={isCreate}
                    canSave={canSave}
                    canSubmit={!!canSubmit}
                    isSubmitting={isSubmitting}
                    onSaveStay={() => doSave("stay")}
                    onSaveClose={() => doSave("close")}
                    onRequestSubmit={() => setSubmitOpen(true)}
                />

                {isReadOnly && (
                    <div className="rounded-lg bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
                        This requisition is <strong>{initial?.status}</strong> and cannot
                        be edited.
                    </div>
                )}

                {initial?.status === "Rejected" && initial.rejectionNotes && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                        <p className="mb-1 font-semibold">Rejection Notes</p>
                        <p>{initial.rejectionNotes}</p>
                    </div>
                )}

                <TabBar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} />

                <fieldset
                    disabled={isReadOnly || isSubmitting}
                    className="space-y-4"
                >
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
                            isVanDriverActive={initial?.isVanDriverActive}
                            isShopActive={initial?.isShopActive}
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
                            />
                        );
                    })}

                    {activeTab === "mileage" && (
                        <MileageTab
                            arr={mileagesArr}
                            register={register}
                            errors={errors}
                            maxPerDay={
                                limitLookup[WELL_KNOWN_LIMITS.MILEAGE_DAILY_QTY]
                                    ?.numericalLimit
                            }
                            maxRate={
                                limitLookup[WELL_KNOWN_LIMITS.MILEAGE_RATE]?.currencyLimit
                            }
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
                            maxPerDay={
                                limitLookup[WELL_KNOWN_LIMITS.TRANSFER_DAILY_QTY]
                                    ?.numericalLimit
                            }
                            maxRate={
                                limitLookup[WELL_KNOWN_LIMITS.TRANSFER_RATE]?.currencyLimit
                            }
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
                            Once submitted, this requisition will no longer be editable.
                            Are you sure you want to submit{" "}
                            <strong>{initial?.requisitionNumber}</strong>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setSubmitOpen(false)}
                            >
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
// Header & Tab bar
// ────────────────────────────────────────────────────────────────────────────

type FormHeaderProps = {
    initial: FeRequisitionDetail | null;
    subtotal: number;
    totalErrors: number;
    isReadOnly: boolean;
    isCreate: boolean;
    canSave: boolean;
    canSubmit: boolean;
    isSubmitting: boolean;
    onSaveStay: () => void;
    onSaveClose: () => void;
    onRequestSubmit: () => void;
};

function FormHeader({
    initial,
    subtotal,
    totalErrors,
    isReadOnly,
    isCreate,
    canSave,
    canSubmit,
    isSubmitting,
    onSaveStay,
    onSaveClose,
    onRequestSubmit,
}: Readonly<FormHeaderProps>) {
    return (
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
                        onClick={onSaveStay}
                        disabled={!canSave || isSubmitting}
                    >
                        Save &amp; Continue
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onSaveClose}
                        disabled={!canSave || isSubmitting}
                    >
                        Save &amp; Close
                    </Button>
                    {!isCreate && (
                        <Button
                            onClick={onRequestSubmit}
                            disabled={!canSubmit || isSubmitting}
                        >
                            <Send size={14} />
                            Submit
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

type TabBarProps = {
    tabs: TabSpec[];
    activeTab: string;
    onSelect: (key: string) => void;
};

function TabBar({ tabs, activeTab, onSelect }: Readonly<TabBarProps>) {
    return (
        <div className="flex gap-1 overflow-x-auto border-b border-border">
            {tabs.map((t) => (
                <button
                    key={t.key}
                    type="button"
                    onClick={() => onSelect(t.key)}
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
    );
}
