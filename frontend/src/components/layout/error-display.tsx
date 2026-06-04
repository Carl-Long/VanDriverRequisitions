type ErrorDisplayProps = {
    title?: string;
    message?: string;
    onReset: () => void;
};

export function ErrorDisplay({
    title = "Something went wrong",
    message,
    onReset,
}: Readonly<ErrorDisplayProps>) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {message && (
                    <p className="mt-2 text-muted-foreground">{message}</p>
                )}
                <button
                    onClick={onReset}
                    className="mt-4 rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:opacity-90 transition font-medium"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
