import { formatDateTime } from "@/lib/format/date";
import { cn } from "@/lib/utils";

type Props = {
    date: string | null;
    user: string | null;
    fallbackUser?: string;
    userClassName?: string;
};

export function ActivityMetaCell({
    date,
    user,
    fallbackUser = "System",
    userClassName,
}: Readonly<Props>) {
    return (
        <div className="flex flex-col leading-tight">
            <span className="text-sm text-foreground">{date ? formatDateTime(date) : "—"}</span>

            <span className={cn("text-xs text-muted-foreground", userClassName)}>
                {user || fallbackUser}
            </span>
        </div>
    );
}
