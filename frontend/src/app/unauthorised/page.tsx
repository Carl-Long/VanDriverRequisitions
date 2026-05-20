export default function UnauthorisedPage() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <h1 className="text-xl font-semibold">Access denied</h1>
                <p className="text-muted-foreground mt-2">
                    You don’t have permission to view this page.
                </p>
            </div>
        </div>
    );
}