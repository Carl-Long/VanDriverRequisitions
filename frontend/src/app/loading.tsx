export default function Loading() {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-border border-t-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Loading...</p>
            </div>
        </div>
    );
}
