import { cn } from "@/lib/utils";

type Props = {
    vanDriverName?: string | null;
    vanDriverCode?: string | null;
    tradersName?: string | null;
    className?: string;
    maxWidthClassName?: string;
};

export function VanDriverIdentityCell({
    vanDriverName,
    vanDriverCode,
    tradersName,
    className,
    maxWidthClassName = "max-w-[260px]",
}: Readonly<Props>) {
    const primaryText = vanDriverName?.trim() || "Unknown driver";
    const codeText = vanDriverCode?.trim() || null;
    const traderText = tradersName?.trim() || null;
    const secondaryTitle = [codeText, traderText].filter(Boolean).join(" · ");

    return (
        <div className={cn("flex min-w-0 flex-col leading-tight", className)}>
            <span
                title={primaryText}
                className={cn(
                    "truncate font-medium text-foreground",
                    maxWidthClassName,
                )}
            >
                {primaryText}
            </span>

            {secondaryTitle && (
                <span
                    title={secondaryTitle}
                    className={cn(
                        "truncate text-xs text-muted-foreground",
                        maxWidthClassName,
                    )}
                >
                    {codeText}
                    {codeText && traderText && <> · </>}
                    {traderText}
                </span>
            )}
        </div>
    );
}