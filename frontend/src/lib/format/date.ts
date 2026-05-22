export function formatDateGB(date?: string | null): string | null {
    if (!date) return null;

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}