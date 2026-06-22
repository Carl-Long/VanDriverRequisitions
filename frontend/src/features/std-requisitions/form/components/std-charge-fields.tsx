import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";

import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdChargeFields } from "../types/std-charge-fields";
import { RatePerMileField } from "@/features/requisitions-shared/components/form-fields/rate-per-mile-field";

type ChargeFieldErrors = Partial<
    Record<"miles" | "ratePerMile" | "flatCharge", string>
>;

type Props = {
    charge: StdChargeFields;
    errors: ChargeFieldErrors;
    defaultRatePerMile?: number | null;
    onChange: (patch: Partial<StdChargeFields>) => void;
};
function parseNumberInput(value: string) {
    return value === "" ? null : Number(value);
}

export function StdChargeFields({
    charge,
    errors,
    defaultRatePerMile,
    onChange,
}: Readonly<Props>) {
    if (charge.chargeType === STD_CHARGE_TYPE.Mileage) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Miles" required error={errors.miles}>
                    <Input
                        type="number"
                        min={1}
                        step={1}
                        value={charge.miles ?? ""}
                        state={errors.miles ? "error" : "default"}
                        onChange={(event) => {
                            onChange({
                                miles: parseNumberInput(event.target.value),
                            });
                        }}
                    />
                </Field>

                <RatePerMileField
                    value={charge.ratePerMile}
                    defaultValue={defaultRatePerMile ?? null}
                    error={errors.ratePerMile}
                    onChange={(ratePerMile) => {
                        onChange({
                            ratePerMile,
                        });
                    }}
                />
            </div>
        );
    }

    return (
        <Field label="Flat Charge" required error={errors.flatCharge}>
            <Input
                type="number"
                min="0.01"
                step="0.01"
                value={charge.flatCharge ?? ""}
                state={errors.flatCharge ? "error" : "default"}
                onChange={(event) => {
                    onChange({
                        flatCharge: parseNumberInput(event.target.value),
                    });
                }}
            />
        </Field>
    );
}