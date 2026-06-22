import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";

import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdChargeFields } from "../types/std-charge-fields";

type ChargeFieldErrors = Partial<
    Record<"miles" | "ratePerMile" | "flatCharge", string>
>;

type Props = {
    charge: StdChargeFields;
    errors: ChargeFieldErrors;
    onChange: (patch: Partial<StdChargeFields>) => void;
};

function parseNumberInput(value: string) {
    return value === "" ? null : Number(value);
}

export function StdChargeFields({
    charge,
    errors,
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

                <Field
                    label="Rate Per Mile"
                    required
                    error={errors.ratePerMile}
                >
                    <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={charge.ratePerMile ?? ""}
                        state={errors.ratePerMile ? "error" : "default"}
                        onChange={(event) => {
                            onChange({
                                ratePerMile: parseNumberInput(
                                    event.target.value,
                                ),
                            });
                        }}
                    />
                </Field>
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