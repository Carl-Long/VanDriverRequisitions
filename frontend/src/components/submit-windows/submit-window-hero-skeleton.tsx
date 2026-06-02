
import { Skeleton } from "@/components/ui/skeleton";

export function SubmitWindowHeroSkeleton() {
    return (
        <div className="rounded-xl border border-border p-4">
            <Skeleton className="mb-2 h-5 w-40" />
            <Skeleton className="h-4 w-64" />
        </div>
    );
}