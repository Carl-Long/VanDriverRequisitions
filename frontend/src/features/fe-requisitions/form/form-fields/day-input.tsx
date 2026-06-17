import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";

type Props = {
    label: string;
    value: number | null;
    error?: string;
    onChange: (value?: number) => void;
};

export function DayInput({ label, value, error, onChange }: Readonly<Props>) {
    return (
        <Field label={label} error={error}>
            <Input
                type="number"
                min={0}
                step={1}
                value={value ?? ""}
                state={error ? "error" : "default"}
                onChange={(event) =>
                    onChange(event.target.value ? Number(event.target.value) : undefined)
                }
            />
        </Field>
    );
}