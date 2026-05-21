import { cn } from "@/lib/utils";

type Props = {
    checked: boolean;
    onChange: () => void;
    ariaLabel?: string;
};

export function Toggle({
    checked,
    onChange,
    ariaLabel,
}: Readonly<Props>) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-label={ariaLabel}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                checked
                    ? "bg-success"
                    : "bg-muted"
            )}
        >
            <span
                className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    checked ? "translate-x-6" : "translate-x-1"
                )}
            />
        </button>
    );
}