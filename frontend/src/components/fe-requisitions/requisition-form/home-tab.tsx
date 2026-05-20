"use client";

import {
    useWatch,
    type Control,
    type FieldErrors,
    type UseFormRegister,
    type UseFormSetValue,
} from "react-hook-form";
import { AlertCircle, Building2, CalendarDays, User } from "lucide-react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import type { ShopLookup } from "@/lib/api/shops";
import type { VanDriverLookup } from "@/lib/api/van-drivers";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import { inputClass } from "./utils";

export type HomeTabProps = {
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    control: Control<RequisitionFormData>;
    setValue: UseFormSetValue<RequisitionFormData>;
    selectedDriver: VanDriverLookup | null;
    setSelectedDriver: (d: VanDriverLookup | null) => void;
    selectedShop: ShopLookup | null;
    setSelectedShop: (s: ShopLookup | null) => void;
    fetchDrivers: (
        search: string,
    ) => Promise<ComboboxOption<VanDriverLookup>[]>;
    fetchShops: (search: string) => Promise<ComboboxOption<ShopLookup>[]>;
    isVanDriverActive?: boolean;
    isShopActive?: boolean;
};

export function HomeTab({
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
    isVanDriverActive = true,
    isShopActive = true,
}: Readonly<HomeTabProps>) {
    const vanDriverId = useWatch({ control, name: "vanDriverId" });
    const shopId = useWatch({ control, name: "shopId" });

    function handleDriverChange(
        value: string | null,
        data: VanDriverLookup | null,
    ) {
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
                                    <span className="font-mono font-medium">
                                        {opt.data.code}
                                    </span>{" "}
                                    — {opt.data.tradersName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {[opt.data.town, opt.data.postcode]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                            </div>
                        )}
                    />
                    {errors.vanDriverId && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.vanDriverId.message}
                        </p>
                    )}
                    {!isVanDriverActive && vanDriverId && (
                        <p className="mt-1.5 rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                            <AlertCircle
                                size={12}
                                className="mr-1 inline -translate-y-px"
                            />
                            This van driver is inactive. If you change it, the
                            current selection will no longer be available.
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
                        <p className="mt-1 text-xs text-red-500">
                            {errors.shopId.message}
                        </p>
                    )}
                    {!isShopActive && shopId && (
                        <p className="mt-1.5 rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                            <AlertCircle
                                size={12}
                                className="mr-1 inline -translate-y-px"
                            />
                            This shop is inactive. If you change it, the current
                            selection will no longer be available.
                        </p>
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

            {selectedDriver && <DriverDetails driver={selectedDriver} />}
        </div>
    );
}

function DriverDetails({ driver }: Readonly<{ driver: VanDriverLookup }>) {
    return (
        <div className="rounded-lg border border-border-subtle bg-surface-elevated p-4 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Van Driver Details
            </p>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <div>
                    <dt className="text-xs text-muted-foreground">Traders Name</dt>
                    <dd className="text-foreground">{driver.tradersName}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">Address</dt>
                    <dd className="text-foreground">
                        {[
                            driver.address1,
                            driver.address2,
                            driver.town,
                            driver.postcode,
                        ]
                            .filter(Boolean)
                            .join(", ")}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">Phone</dt>
                    <dd className="text-foreground">{driver.phone || "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">VAT</dt>
                    <dd>
                        {driver.hasVat ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                VAT Registered{" "}
                                {driver.vatNumber ? `(${driver.vatNumber})` : ""}
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
    );
}
