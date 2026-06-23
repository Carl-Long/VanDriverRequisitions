import { Button } from "@/components/ui/button/button";
import { Field } from "@/components/ui/field/field";

import { STD_CHARGE_TYPE, type StdChargeType } from "../../constants/std-charge-type.constants";

type Props = {
    value: StdChargeType;
    error?: string;
    onChange: (chargeType: StdChargeType) => void;
};

export function StdChargeTypeToggle({
    value,
    error,
    onChange,
}: Readonly<Props>) {
    return (
        <Field label="Charge Type" required error={error}>
            <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant={
                        value === STD_CHARGE_TYPE.FlatCharge
                            ? "solid"
                            : "outline"
                    }
                    onClick={() => onChange(STD_CHARGE_TYPE.FlatCharge)}
                >
                    Flat charge
                </Button>

                <Button
                    type="button"
                    variant={
                        value === STD_CHARGE_TYPE.Mileage ? "solid" : "outline"
                    }
                    onClick={() => onChange(STD_CHARGE_TYPE.Mileage)}
                >
                    Mileage
                </Button>
            </div>
        </Field>
    );
}