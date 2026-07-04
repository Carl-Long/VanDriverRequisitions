"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { Modal } from "@/components/ui/modal";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";
import { StdCollectionTypeField } from "@/features/std-collection-types/std-collection-type-field";
import { ApiError } from "@/lib/api/client";
import { StdLocation } from "./std-location.types";
import { AdminFormServerError } from "../admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "../admin-shared/admin-modal-form-actions";

const stdLocationSchema = z.object({
    shopId: z.string().min(1, "Shop is required."),
    collectionTypeId: z.string().min(1, "Collection type is required."),
    locationName: z
        .string()
        .trim()
        .min(1, "Location name is required.")
        .max(150, "Location name must be 150 characters or fewer."),
    postCode: z
        .string()
        .trim()
        .min(1, "Postcode is required.")
        .max(10, "Postcode must be 10 characters or fewer."),
});

type StdLocationFormData = z.infer<typeof stdLocationSchema>;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: StdLocationFormData) => Promise<void>;
    initial?: StdLocation | null;
};

export function StdLocationFormModal(props: Readonly<Props>) {
    if (!props.open) {
        return null;
    }

    return (
        <StdLocationFormModalContent
            key={props.initial?.id ?? "new"}
            {...props}
        />
    );
}

function StdLocationFormModalContent({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<Props>) {
    const isEditing = !!initial;

    const [serverError, setServerError] = useState<string | null>(null);
    const [shopLabel, setShopLabel] = useState<string | null>(() => initial ? `${initial.shopCode} - ${initial.shopName}` : null);
    const [isSelectedShopActive, setIsSelectedShopActive] = useState<boolean | null>(() => initial?.isShopActive ?? null);

    const [collectionTypeLabel, setCollectionTypeLabel] = useState<string | null>(() =>
        initial
            ? `${initial.collectionTypeCode} - ${initial.collectionTypeName}`
            : null,
    );
    const [isSelectedCollectionTypeActive, setIsSelectedCollectionTypeActive] = useState<boolean | null>(() => initial?.isCollectionTypeActive ?? null);

    const {
        register,
        handleSubmit,
        control,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<StdLocationFormData>({
        resolver: zodResolver(stdLocationSchema),
        defaultValues: {
            shopId: initial?.shopId ?? "",
            collectionTypeId: initial?.collectionTypeId ?? "",
            locationName: initial?.locationName ?? "",
            postCode: initial?.postCode ?? "",
        },
    });

    const shopId = useWatch({ control, name: "shopId" });

    const collectionTypeId = useWatch({ control, name: "collectionTypeId" });

    function handleClose() {
        onClose();
    }

    function applyApiErrors(error: ApiError) {
        if (!error.errors) {
            setServerError(error.message ?? "Something went wrong.");
            return;
        }

        if (error.errors.ShopId?.[0]) {
            setError("shopId", { message: error.errors.ShopId[0] });
        }

        if (error.errors.CollectionTypeId?.[0]) {
            setError("collectionTypeId", {
                message: error.errors.CollectionTypeId[0],
            });
        }

        if (error.errors.LocationName?.[0]) {
            setError("locationName", {
                message: error.errors.LocationName[0],
            });
        }

        if (error.errors.PostCode?.[0]) {
            setError("postCode", { message: error.errors.PostCode[0] });
        }
    }

    async function onValid(data: StdLocationFormData) {
        setServerError(null);

        try {
            await onSubmit({
                ...data,
                locationName: data.locationName.trim(),
                postCode: data.postCode.trim().toUpperCase(),
            });
        } catch (err) {
            if (err instanceof ApiError) {
                applyApiErrors(err);
                return;
            }

            setServerError("Unexpected error occurred.");
        }
    }

    const title = isEditing ? "Edit STD Location" : "Create STD Location";

    return (
        <Modal open={open} onClose={handleClose} title={title}>
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">

                <AdminFormServerError message={serverError} />

                <ShopFilterField
                    required
                    value={shopId || null}
                    label={shopLabel}
                    isShopActive={isSelectedShopActive}
                    error={errors.shopId?.message}
                    placeholder="Select shop"
                    onChange={(value, label) => {
                        setValue("shopId", value ?? "", {
                            shouldValidate: true,
                            shouldDirty: true,
                        });
                        setShopLabel(label);
                        setIsSelectedShopActive(value ? true : null);
                    }}
                />

                <StdCollectionTypeField
                    required
                    value={collectionTypeId || null}
                    label={collectionTypeLabel}
                    isCollectionTypeActive={isSelectedCollectionTypeActive}
                    error={errors.collectionTypeId?.message}
                    onChange={(value, label) => {
                        setValue("collectionTypeId", value ?? "", {
                            shouldValidate: true,
                            shouldDirty: true,
                        });
                        setCollectionTypeLabel(label);
                        setIsSelectedCollectionTypeActive(value ? true : null);
                    }}
                />

                <Field label="Location Name" error={errors.locationName?.message} required>
                    <Input
                        {...register("locationName")}
                        maxLength={150}
                        placeholder="e.g. High Street Charity Bank"
                        state={errors.locationName ? "error" : "default"}
                    />
                </Field>

                <Field label="Postcode" error={errors.postCode?.message} required>
                    <Input
                        {...register("postCode")}
                        maxLength={10}
                        placeholder="e.g. AB1 2CD"
                        state={errors.postCode ? "error" : "default"}
                    />
                </Field>

                <AdminModalFormActions
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    onCancel={handleClose}
                />
            </form>
        </Modal>
    );
}