import { cn } from "@/lib/utils";

type Props = {
    checked: boolean;
    onChange: () => void;
    ariaLabel?: string;
    disabled?: boolean;
    loading?: boolean;
};

export function Toggle({
    checked,
    onChange,
    ariaLabel,
    disabled = false,
    loading = false,
}: Readonly<Props>) {
    const isDisabled = disabled || loading;

    return (
        <button
            type="button"
            onClick={onChange}
            aria-label={ariaLabel}
            aria-busy={loading}
            disabled={isDisabled}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                checked ? "bg-success" : "bg-muted",
            )}
        >
            {loading ? (
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
            ) : (
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        checked ? "translate-x-6" : "translate-x-1",
                    )}
                />
            )}
        </button>
    );
}