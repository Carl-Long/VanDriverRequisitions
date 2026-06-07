import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/format/date";

type AuditFieldProps = {
    label: string;
    name: string | null;
    dateTime: string | null;
};

export function AuditField({
    label,
    name,
    dateTime,
}: Readonly<AuditFieldProps>) {
    if (!name && !dateTime) {
        return null;
    }

    return (
        <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </div>

            {name && (
                <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {name}
                </div>
            )}

            {dateTime && (
                <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateTime(dateTime)}
                </div>
            )}
        </div>
    );
}